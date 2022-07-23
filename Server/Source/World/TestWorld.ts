import { World } from "./World"
import { PlayerInputController } from "../Scripts/Player/PlayerInputController"
import { Entity } from "../Base/Entity"
import { TransformSystem } from "../Systems/TransformSystem";
import { AABBDrawableComponent, DrawingSystem, SpriteTexture } from "../Systems/DrawingSystem";
import { ClientConnectionSystem } from "../Systems/ClientConnectionSystem";
import * as WebSocket from 'websocket'
import { WorldSerializer } from "../Serialization/Serializer"
import { ScriptSystem } from "../Systems/ScriptSystem";
import { PlayerIdentity } from "../Scripts/Player/PlayerIdentity";
import { BasicMovement } from "../Scripts/Player/BasicMovement";
import { throws } from "assert";
import { vec2, mat4 } from "gl-matrix"

class TestPlayer extends ScriptSystem.Component
{
    private _transform: TransformSystem.Component;
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

        this._transform = new TransformSystem.Component(entity);
        world.registerComponent(entity, this._transform);

        this._drawable = new SpriteTexture(entity,"WOL\\RedMage.png", 2, 2);
        world.registerComponent(entity, this._drawable);

        this._playerInputController = new PlayerInputController(entity);
        world.registerComponent(entity, this._playerInputController);

        const playerIdentity = new PlayerIdentity(entity, name);
        world.registerComponent(entity, playerIdentity);

        this._movement = new BasicMovement(entity);
        world.registerComponent(entity, this._movement);

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
    private _transform: TransformSystem.Component;

    constructor(owner: Entity, name: string) {
        super(owner);

        const entity = this.ownerEntity;
        const world = entity.getWorld();

        this._drawable = new AABBDrawableComponent(entity, "");
        world.registerComponent(entity, this._drawable);

        this._transform = new TransformSystem.Component(entity);
        this._transform.setScale([7, 7, 7]);
        this._transform.setRotation([Math.PI/2.0, 0, Math.PI/4.0]);
        this._transform.setPosition([0, 0, 0.2]);
        world.registerComponent(entity, this._transform); 
    }

    preUpdate(): void {
        
    }
    onUpdate(): void {

    }
    postUpdate(): void {

    }
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