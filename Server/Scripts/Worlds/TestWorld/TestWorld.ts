import { World } from "@core/World/World"
import { Entity } from "@core/Base/Entity"
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { Serializer } from "@core/Serialization/Serializer"
import { ClientConnectionSystem } from "@core/Systems/ClientConnectionSystem";
import { vec4tovec3 } from "@core/Common/Math/gl-extensions";
import { BlockingCollisionSystem2D } from "@core/Systems/BlockingCollisionSystem2D";
import { CircleWorldAoEDrawableComponent } from "@scripts/Comon/Mechanics/CircleWorldAoEDrawableComponent";

import { PlayerInputController } from "@scripts/Comon/Player/PlayerInputController"
import { PlayerIdentity } from "@scripts/Comon/Player/PlayerIdentity";
import { BasicMovement } from "@scripts/Comon/Player/BasicMovement";
import { TriggerCollisionSystem2D } from "@systems/TriggerCollisionSystem2D";
import { CameraSystem } from "@systems/CameraSystem";
import { CircleWorldAoE } from "@scripts/Comon/Mechanics/CircleWorldAoE";


import { vec2, vec4, mat4, vec3 } from "gl-matrix"
import * as WebSocket from 'websocket'
import { GlobalClock } from "@core/Base/GlobalClock";
import { Devour, DevourPattern } from "../Abyssos/The Fifth Circle Savage/Devour";
import { Waymark, WaymarkType } from "@scripts/Comon/Waymarks/Waymark";
import { CharacterDrawable, CharacterType } from "@scripts/Comon/WOL/CharacterDrawable";
import { TextureSquareDrawable } from "@scripts/Comon/Basic/Drawing/TextureSquareDrawable";
import { SpriteSquareDrawable } from "@scripts/Comon/Basic/Drawing/SpriteSquareDrawable";


class TestPlayer extends ScriptSystem.Component
{
    private _drawable: CharacterDrawable;
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
        const world = entity.world;

        this._drawable = new CharacterDrawable(entity, CharacterType.RedMage);
        world.registerComponent(entity, this._drawable);
        this._drawable.transform.rotate([1, 0, 0], Math.PI/4.0)
        this._drawable.transform.scale([1, 1, 1]);

        this._playerInputController = new PlayerInputController(entity);
        world.registerComponent(entity, this._playerInputController);

        const playerIdentity = new PlayerIdentity(entity, name);
        world.registerComponent(entity, playerIdentity);

        this._movement = new BasicMovement(entity);
        world.registerComponent(entity, this._movement);

        const playerColliderEntity = world.createEntity();
        
        const trigger = new TriggerCollisionSystem2D.CircleTriggerComponent(playerColliderEntity, 1);
        world.registerComponent(playerColliderEntity, trigger);
        trigger.shape.radius = 0.46;

        const blocking = new BlockingCollisionSystem2D.CircleCollisionComponent(owner);
        blocking.shape.radius = 0.5;
        world.registerComponent(owner, blocking);
        
        const triggerDrawableComponent = new TextureSquareDrawable(playerColliderEntity, "Test/circle.png");
        world.registerComponent(playerColliderEntity, triggerDrawableComponent);
        triggerDrawableComponent.size = blocking.shape.radius;

        var isCollided = false;
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
                    vec4.fromValues(0, 0, 0, 1),
                    this._follower.transform.worldTransform);
                const followedWorldPosition = vec4.transformMat4(
                    vec4.create(),
                    vec4.fromValues(0, 0, 0, 1),
                    this._followed.transform.worldTransform
                );
                const positionDiffWorldSpace = vec4.sub(vec4.create(), followedWorldPosition, followerWorldPosition);
                const invertFollowerTransform = mat4.invert(mat4.create(), this._follower.transform.transform);
                const positionDiffApply = vec4tovec3(vec4.transformMat4(vec4.create(), positionDiffWorldSpace, invertFollowerTransform));

                this._follower.transform.move(positionDiffApply);
            }
            postUpdate(): void {
                isCollided = false;
            }

        };

        const triggerFollowPlayer = new Follower(playerColliderEntity, owner);
        world.registerComponent(playerColliderEntity, triggerFollowPlayer);

        trigger.triggerListener = {
            onTriggered(triggededBy: Readonly<TriggerCollisionSystem2D.Component>) {
                isCollided = true;
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

        let spriteSelect: vec2 = [0, 0];
        
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
        
        this._drawable.selection = spriteSelect;
    }
}

class Platform extends ScriptSystem.Component
{
    private _drawable: TextureSquareDrawable;

    constructor(owner: Entity, name: string) {
        super(owner);

        const entity = this.ownerEntity;
        const world = entity.world;

        this._drawable = new TextureSquareDrawable(entity, "/Test/Platform.png");
        world.registerComponent(entity, this._drawable);

        const transform = this._drawable.transform;
        transform.scale([7, 7, 7]);
        transform.move([0, -0.001, 0]);
    }

    preUpdate(): void {
        
    }
    onUpdate(): void {

    }
    postUpdate(): void {

    }
}



function roundAreaOfEffectInitialize(owner: Entity) {
    const aoeComponent = new TriggerCollisionSystem2D.CircleTriggerComponent(owner, 1);
    owner.world.registerComponent(owner, aoeComponent);
    aoeComponent.shape.radius = 3;

    const drawableComponent = new CircleWorldAoEDrawableComponent(owner, aoeComponent.shape.radius);
    owner.world.registerComponent(owner, drawableComponent);

    const transform = drawableComponent.transform;
    transform.scale([aoeComponent.shape.radius, aoeComponent.shape.radius, aoeComponent.shape.radius]);

    class SineMotionUpdate extends ScriptSystem.Component {

        constructor(owner: Entity) {
            super(owner);

        }
        preUpdate(): void {
            
        }
        onUpdate(): void {
            let dateTime = new Date();
            var ms = dateTime.getTime();
            owner.transform.moveTo([-3+3*Math.sin(ms/1000), 0, 0]);
        }
        postUpdate(): void {
            
        }

    };

    const motion = new SineMotionUpdate(owner);
    owner.world.registerComponent(owner, motion);
}

function rectAreaOfEffectInitialize(owner: Entity) {
    const aoeComponent = new TriggerCollisionSystem2D.RectangleTriggerComponent(owner);
    owner.world.registerComponent(owner, aoeComponent);
    aoeComponent.shape.width = 2;
    aoeComponent.shape.height = 1;

    // TODO: Bring back rectangle aoe
    // const drawableComponent = new DrawableAoERectangleClosed(owner, aoeComponent.shape.width, aoeComponent.shape.height);
    // owner.world.registerComponent(owner, drawableComponent);

    // const transform = drawableComponent.transform;
    // transform.scale([aoeComponent.shape.width, 0, aoeComponent.shape.height]);

    // class SineMotionUpdate extends ScriptSystem.Component {

    //     constructor(owner: Entity) {
    //         super(owner);

    //     }
    //     preUpdate(): void {
            
    //     }
    //     onUpdate(): void {
    //         let dateTime = new Date();
    //         var ms = dateTime.getTime();
    //         const s = (ms/1000.0) / 5.0;
    //         owner.transform.moveTo([1.5, 0, 1.5 + 1.5*Math.sin(Math.PI + ms/1000)]);
    //         //owner.transform.rotation = [0, 2.0 * Math.PI * (s - Math.floor(s)), 0];
    //     }
    //     postUpdate(): void {
            
    //     }

    // };

    // const motion = new SineMotionUpdate(owner);
    // owner.world.registerComponent(owner, motion);

    // owner.transform.move([5, 0, 0]); 
    // owner.transform.scale([ 2, 2, 2]);
}

function blockingPlaneInitialize(owner: Entity) {
    for (var i=0; i<4; ++i) {
        const blockingComponent = new BlockingCollisionSystem2D.PlaneCollisionComponent(owner, true);
        blockingComponent.shape.normal = vec2.fromValues(1.0, 0);
        mat4.rotateY(blockingComponent.transform, blockingComponent.transform,  i * Math.PI/2);        
        mat4.translate(blockingComponent.transform, blockingComponent.transform, vec3.fromValues(-7.0, 0, 0));
        owner.world.registerComponent(owner, blockingComponent)
    }

    const blockingDome = new BlockingCollisionSystem2D.DomeCollisionComponent(owner, true);
    blockingDome.shape.radius = 5;
    mat4.translate(blockingDome.transform, blockingDome.transform, vec3.fromValues(-3, 0, 0));
    // Dont need dome now.
    //owner.world.registerComponent(owner, blockingDome);
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

        owner.transform.rotate([0, 1, 0], Math.PI/4);
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

        const world = entity.world;

        // Remove self. My work is done.
        world.unregisterComponent(this);
    }
}

export class TestWorld extends World {

    serializer = new Serializer();
    isInitialized = false;

    update() {
        super.update();
        this.serializer.update(this);
        this.clientConnectionSystem.broadcastMessage(this.serializer.toJson());
    }


    constructor(wsServer: WebSocket.server)
    {
        super("D:\\Programming\\FFXIVSavagePlayground\\Server\\Assets\\Worlds\\TestWorld")
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
                const aoeCircle = this.createEntity();
                const aoeRect = this.createEntity();
                const waymark = this.createEntity();

                const devour = this.createEntity();

                const blockPlane = this.createEntity();

                //roundAreaOfEffectInitialize(aoeCircle);
                //rectAreaOfEffectInitialize(aoeRect);
                blockingPlaneInitialize(blockPlane);

                const connectionComponent = new ClientConnectionSystem.Component(playerEntity, regConnection);
                this.registerComponent(playerEntity, connectionComponent);

                const initializationComponent = new TestPlayerInitializer(playerEntity);
                this.registerComponent(playerEntity, initializationComponent);

                const platformComponent = new Platform(platform, "");
                this.registerComponent(platform, platformComponent);

                connection.on('message', (message) => {
                    // console.log('Received Message: ', message);
                    regConnection.receiveMessage(message);
                })

                connection.on('close', (reasonCode, desc) => {
                    console.log('Client has disconnected');
                    this.clientConnectionSystem.removeConnection(connection);
                });

                const cameraHolder = this.createEntity(playerEntity);
                const cameraComponent = new CameraSystem.Component(cameraHolder);
                this.registerComponent(cameraHolder, cameraComponent);

                // Camera setup
                {
                    const projectionMatrix = mat4.create();
                    mat4.identity(projectionMatrix);
                    const fovy = 45.0 * Math.PI / 180.0;
                    const aspect = 1200.0/1200.0;
                    const near = 0.1;
                    const far = 100;

                    // cameraComponent.projection =  mat4.perspective(
                    //     projectionMatrix,
                    //     fovy,
                    //     aspect,
                    //     near,
                    //     far
                    // )

                    cameraComponent.projection = mat4.ortho(
                        projectionMatrix,
                        -7, 7,
                        -7, 7, 
                        near,
                        far
                    );

                    const viewTransform  = mat4.create();
                    cameraComponent.transform = mat4.lookAt(viewTransform, vec3.fromValues(0, 18, -18), vec3.fromValues(0, 0, 0,), vec3.fromValues(0, 1, 0));

                    cameraComponent.projection = projectionMatrix;
                }

                // Repeating AoE
                {
                    class ReloadAoE extends ScriptSystem.Component {
                        
                        private _circleAoe: CircleWorldAoE | undefined;
                        constructor(owner: Entity) {
                            super (owner);
                        }

                        preUpdate(): void {
                            
                        }

                        onUpdate(): void {
                            if (this._circleAoe === undefined || this._circleAoe.isExploded) {
                                this._circleAoe = new CircleWorldAoE(this.ownerEntity, 3, 5000);
                                this.ownerEntity.transform.moveTo(mat4.getTranslation(vec3.create(), playerEntity.transform.worldTransform));
                            }
                        }

                        postUpdate(): void {
                            
                        }
                    };

                    if (false) {
                        const aoeRepeating = this.createEntity();
                        const reloader = new ReloadAoE(aoeRepeating);
                        this.registerComponent(aoeRepeating, reloader);
                    }
                }

                // Devour
                {
                    const devourComponent = new Devour(devour, DevourPattern.ZigZag, GlobalClock.clock.getTimeMs() + 5000);
                }

                // Waymark
                if (!this.isInitialized)
                {
                    const Aentity = this.createEntity();
                    const Bentity = this.createEntity();
                    const Centity = this.createEntity();
                    const Dentity = this.createEntity();
                    
                    const scale = 3.0;
                    Aentity.transform.move(vec3.fromValues(-scale, 0, +scale));
                    Bentity.transform.move(vec3.fromValues(+scale, 0, +scale));
                    Centity.transform.move(vec3.fromValues(-scale, 0, -scale));
                    Dentity.transform.move(vec3.fromValues(+scale, 0, -scale));

                    new Waymark(Aentity, WaymarkType._A);
                    new Waymark(Bentity, WaymarkType._B);
                    new Waymark(Centity, WaymarkType._C);
                    new Waymark(Dentity, WaymarkType._D);

                    waymark.addChild(Aentity);
                    waymark.addChild(Bentity);
                    waymark.addChild(Centity);
                    waymark.addChild(Dentity);


                    // Test waymark letter
                    const letter = new TextureSquareDrawable(Aentity, 'Common/Waymarks/A.png');
                    letter.transform.rotate([-1, 0, 0], Math.PI/2);
                    letter.transform.rotate([0, 0, 1], Math.PI/4);
                    letter.transform.move([0, 0, 3]);
                    this.registerComponent(Aentity, letter);
                }

                if (!this.isInitialized) {
                    const background = this.createEntity();
                    background.transform.rotate([0, 1, 0], Math.PI/4);

                    const poisonBackground = new TextureSquareDrawable(background, 'Test/Poison.png')
                    poisonBackground.uvScale = [10, 10];
                    poisonBackground.size = 20;
                    poisonBackground.transform.move([0, -0.1, 0])

                    const shinyPoisonBackground = new TextureSquareDrawable(background, 'Test/Splatter1.png')
                    shinyPoisonBackground.uvScale = [5, 5];
                    shinyPoisonBackground.size = 20;
                    shinyPoisonBackground.opacity = 0.6;
                    shinyPoisonBackground.transform.move([0, -0.099, 0])


                    const shinyPoisonBackgroundDeep = new TextureSquareDrawable(background, 'Test/Splatter1.png')
                    shinyPoisonBackgroundDeep.uvScale = [2, 2];
                    shinyPoisonBackgroundDeep.opacity = 0.2;
                    shinyPoisonBackgroundDeep.size = 20;
                    shinyPoisonBackgroundDeep.transform.move([0, -0.099, 0])

                    class UvMotion extends ScriptSystem.Component {
                        preUpdate(): void {
                            
                        }
                        onUpdate(): void {
                            const time = GlobalClock.clock.getTimeMs();
                            shinyPoisonBackground.opacity = 0.3 + 0.3 * Math.abs(Math.sin(time/2000));
                            shinyPoisonBackground.uvOffset = [0.1 * (time/10000), 0.1 * (time/10000)];

                            shinyPoisonBackgroundDeep.uvOffset = [0.05 * (time/15000), 0.03 * (time /15000)];

                        }
                        postUpdate(): void {
                            
                        }

                    }

                    this.registerComponent(background, new UvMotion(background));
                    this.registerComponent(background, poisonBackground);
                    this.registerComponent(background, shinyPoisonBackground);
                    this.registerComponent(background, shinyPoisonBackgroundDeep);
                }

                // Debris
                if (!this.isInitialized)
                {
                    const debris = this.createEntity();
                    debris.transform.move([-10, 0, 0]);
                    debris.transform.rotate([0, 1, 0], Math.PI/4);

                    const debrisDrawable = new SpriteSquareDrawable(debris, "Test/Debris1.png", [2, 1]);
                    debrisDrawable.size = 2;

                    class AnimateDebris extends ScriptSystem.Component {
                        preUpdate(){}
                        onUpdate(){
                            const select = Math.ceil(GlobalClock.clock.getTimeMs() / 1000) % 2;
                            debrisDrawable.selection = [ select, 0 ];
                        }
                        postUpdate(){}
                    }

                    this.registerComponent(debris, debrisDrawable);
                    this.registerComponent(debris, new AnimateDebris(debris));
                }

                // Bubble
                if (!this.isInitialized)
                {
                    const bubble = this.createEntity();
                    bubble.transform.move([-11, 0, -4]);
                    bubble.transform.rotate([0, 1, 0], Math.PI/4);

                    const bubbleDrawable = new SpriteSquareDrawable(bubble, "Test/Bubble.png", [5, 1])
                    bubbleDrawable.size = 4;

                    class AnimateBubble extends ScriptSystem.Component {

                        nextStart = 0;
                        isAnimating = false;

                        preUpdate(){}
                        onUpdate(){
                            if (!this.isAnimating && GlobalClock.clock.getTimeMs() > this.nextStart) {
                                this.isAnimating = true;
                                bubbleDrawable.opacity = 1.0;
                            }

                            if (this.isAnimating) {
                                const select = Math.ceil(GlobalClock.clock.getTimeMs() / 500) % 5;
                                bubbleDrawable.selection = [ select, 0 ];
                            }
                        }
                        postUpdate(){}
                    }

                    this.registerComponent(bubble, bubbleDrawable);
                    this.registerComponent(bubble, new AnimateBubble(bubble));
                }

                this.isInitialized = true;
            });
        }
    }


}