import { World } from "./World"
import { PlayerInputController } from "../Scripts/Player/PlayerInputController"
import { Entity } from "../Base/Entity"
import { AABBDrawableComponent, DrawingSystem, SpriteTexture } from "../Systems/DrawingSystem";
import { ClientConnectionSystem } from "../Systems/ClientConnectionSystem";
import * as WebSocket from 'websocket'
import { WorldSerializer } from "../Serialization/Serializer"
import { ScriptSystem } from "../Systems/ScriptSystem";
import { PlayerIdentity } from "../Scripts/Player/PlayerIdentity";
import { BasicMovement } from "../Scripts/Player/BasicMovement";
import { throws } from "assert";
import { vec2, vec4, mat4, vec3 } from "gl-matrix"
import { TriggerCollisionSystem2D } from "../Systems/TriggerCollisionSystem2D";
import { Transform } from "stream";
import { vec3tovec4, vec4tovec3, vec3decomposed } from "../Common/Math/gl-extensions";


class TestPlayer extends ScriptSystem.Component
{
    private _drawable: SpriteTexture;
    private _playerInputController: PlayerInputController;
    private _movement: BasicMovement;

    private _spriteDirectionMap: any = {
        left: [0, 0],
        right: [1, 0],
        top: [1, 1],
        bottom: [0, 1]
    }

    constructor(owner: Entity, name: string) {
        super(owner);

        const entity = this.ownerEntity;
        const world = entity.getWorld();

        this._drawable = new SpriteTexture(entity,"WOL\\RedMage.png", 2, 2);
        world.registerComponent(entity, this._drawable);

        this._playerInputController = new PlayerInputController(entity);
        world.registerComponent(entity, this._playerInputController);

        const playerIdentity = new PlayerIdentity(entity, name);
        world.registerComponent(entity, playerIdentity);

        this._movement = new BasicMovement(entity);
        world.registerComponent(entity, this._movement);

        class Follower extends ScriptSystem.Component {
            private _followed;
            private _follower;
            constructor(owner: Entity, entityToFollow: Entity) {
                super(owner);
                this._follower = owner;
                this._followed = entityToFollow;
            }

            preUpdate(): void {
                
            }
            onUpdate(): void {
                const followerWorldPosition = vec4.transformMat4(
                    vec4.create(),
                    vec3tovec4(this._follower.getTransform().position, true),
                    this._follower.getTransform().worldTransform);
                const followedWorldPosition = vec4.transformMat4(
                    vec4.create(),
                    vec3tovec4(this._followed.getTransform().position, true),
                    this._followed.getTransform().worldTransform
                );
                const positionDiffWorldSpace = vec4.sub(vec4.create(), followedWorldPosition, followerWorldPosition);
                const invertFollowerTransform = mat4.invert(mat4.create(), this._follower.getTransform().worldTransform);
                const positionDiffApply = vec4tovec3(vec4.transformMat4(vec4.create(), positionDiffWorldSpace, invertFollowerTransform));
                vec3.add(this._follower.getTransform().position, this._follower.getTransform().position, positionDiffApply);
            }
            postUpdate(): void {
                
            }

        };

        const playerColliderEntity = world.createEntity();
        
        const trigger = new TriggerCollisionSystem2D.CircleTriggerComponent(playerColliderEntity);
        world.registerComponent(playerColliderEntity, trigger);
        
        const triggerDrawableComponent = new AABBDrawableComponent(playerColliderEntity, "Test\\circle.png");
        world.registerComponent(playerColliderEntity, triggerDrawableComponent);
        const transform = playerColliderEntity.getTransform();
        transform.scale = [trigger.shape.radius, trigger.shape.radius, trigger.shape.radius];
        transform.rotation = [Math.PI/2.0, 0, Math.PI/4.0];

        const triggerFollowPlayer = new Follower(playerColliderEntity, owner);
        world.registerComponent(playerColliderEntity, triggerFollowPlayer);

        trigger.triggerListener = {
            onTriggered(triggededBy: Readonly<TriggerCollisionSystem2D.Component>) {
                console.log("collided with:" + triggededBy.ownerEntity.getUuid());
            }
        }

        world.registerComponent(entity, this);
    }

    preUpdate(): void {
        
    }
    onUpdate(): void {

    }
    postUpdate(): void {
        const direction = this._movement.direction;
        if (direction[0] == 0 && direction[2] == 0) {
            return;
        }

        let spriteSelect = [0, 0];
        
        if (direction[0] < 0) {
            spriteSelect = this._spriteDirectionMap.right;
        }
        
        if (direction[0] > 0) {
            spriteSelect = this._spriteDirectionMap.left;
        }
        
        if (direction[2] < 0 ) {
            spriteSelect = this._spriteDirectionMap.bottom;
        }
        
        if (direction[2] > 0) {
            spriteSelect = this._spriteDirectionMap.top;
        }
        
        this._drawable.selectedWidthSegment = spriteSelect[0];
        this._drawable.selectedHeightSegment = spriteSelect[1];
    }
}

class Platform extends ScriptSystem.Component
{
    private _drawable: AABBDrawableComponent;

    constructor(owner: Entity, name: string) {
        super(owner);

        const entity = this.ownerEntity;
        const world = entity.getWorld();

        this._drawable = new AABBDrawableComponent(entity, "");
        world.registerComponent(entity, this._drawable);

        const transform = this.ownerEntity.getTransform();
        transform.scale = [7, 7, 7];
        transform.rotation = [Math.PI/2.0, 0, Math.PI/4.0];
        transform.position = [0, 0, 0.2];
    }

    preUpdate(): void {
        
    }
    onUpdate(): void {

    }
    postUpdate(): void {

    }
}



function roundAreaOfEffectInitialize(owner: Entity) {
    const aoeComponent = new TriggerCollisionSystem2D.CircleTriggerComponent(owner);
    aoeComponent.shape.radius = 3;
    owner.getWorld().registerComponent(owner, aoeComponent);

    const drawableComponent = new AABBDrawableComponent(owner, "Test\\circle.png");
    owner.getWorld().registerComponent(owner, drawableComponent);

    const transform = owner.getTransform();
    transform.scale = [aoeComponent.shape.radius, aoeComponent.shape.radius, aoeComponent.shape.radius];
    transform.rotation = [Math.PI/2.0, 0, Math.PI/4.0];

    class SineMotionUpdate extends ScriptSystem.Component {

        constructor(owner: Entity) {
            super(owner);

        }
        preUpdate(): void {
            
        }
        onUpdate(): void {
            let dateTime = new Date();
            var ms = dateTime.getTime();
            owner.getTransform().position =  vec3.fromValues(Math.sin(ms/1000), 0, 0);
        }
        postUpdate(): void {
            
        }

    };

    const motion = new SineMotionUpdate(owner);
    owner.getWorld().registerComponent(owner, motion);

    transform.position = [0, 0, 0.0];
}

class TestPlayerInitializer extends ScriptSystem.Component
{
    private _connection: ClientConnectionSystem.Component | undefined = undefined;

    constructor(owner: Entity) {
        super(owner);

        const connectionComponents = owner.getComponentsByType(ClientConnectionSystem.Component.staticMetaName());
        if (connectionComponents.length === 0) {
            console.log(`%s could not be initialized. %s component required.`, TestPlayerInitializer.staticMetaName(), ClientConnectionSystem.Component.staticMetaName());
        }

        // Assume one.
        this._connection = connectionComponents[0] as ClientConnectionSystem.Component;

        var _this = this;
        this._connection.onMessage = function (message: any) {
            _this.filterMessage(message);
        }
    }

    preUpdate(): void {
        
    }
    onUpdate(): void {
        
    }
    postUpdate(): void {
        
    }
    
    filterMessage(message: any): any | undefined {
        const connectionRequestProp = 'connectionRequest';
        const connectionRequestPlayerNameProp = 'playerName';

        if (message.hasOwnProperty(connectionRequestProp)) {
            const connectionRequest = message[connectionRequestProp];
            if (connectionRequest.hasOwnProperty(connectionRequestPlayerNameProp)) {
                console.log("Got request. Starting initialization...");
                this.initializePlayerEntity(connectionRequest[connectionRequestPlayerNameProp]);
            } else {
                console.log("Requested connection with no name?")
            }
        }
    }

    initializePlayerEntity(name: string) {

        const entity = this.ownerEntity;
        const player = new TestPlayer(entity, name);

        const world = entity.getWorld();

        // Remove self. My work is done.
        world.unregisterComponent(this);
    }
}

export class TestWorld extends World {

    update() {
        super.update();
        this.clientConnectionSystem.broadcastMessage(JSON.stringify(WorldSerializer.serializeWorld(this)));
    }

    constructor(wsServer: WebSocket.server)
    {
        super()
        this.setAssetPath("D:\\Programming\\FFXIVSavagePlayground\\Server\\Assets");
        // 
        {
            wsServer.on('request', (req) => {
                const connection = req.accept(null, req.origin);
                console.log('Got a connection: ' + connection.socket.remoteAddress);

                if (this.clientConnectionSystem.hasConnection(connection.socket!.remoteAddress!)) {
                    console.log('This connection already exists.');
                    console.log('Will have to cover this somehow...');
                    // return;
                }

                const regConnection = this.clientConnectionSystem.registerConnection(connection);

                const platform = this.createEntity();
                const playerEntity = this.createEntity();
                const aoe = this.createEntity();
                
                roundAreaOfEffectInitialize(aoe);

                const connectionComponent = new ClientConnectionSystem.Component(playerEntity, regConnection);
                this.registerComponent(playerEntity, connectionComponent);

                const initializationComponent = new TestPlayerInitializer(playerEntity);
                this.registerComponent(playerEntity, initializationComponent);

                const platformComponent = new Platform(platform, "");
                this.registerComponent(platform, platformComponent);

                connection.on('message', (message) => {
                    console.log('Received Message: ', message);
                    regConnection.receiveMessage(message);
                })

                connection.on('close', (reasonCode, desc) => {
                    console.log('Client has disconnected');
                    this.clientConnectionSystem.removeConnection(connection);
                });

                

            });
        }
    }


}