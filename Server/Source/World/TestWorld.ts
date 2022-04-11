import { World } from "./World"
import { PlayerInputController } from "../Scripts/Player/PlayerInputController"
import { Entity } from "../Base/Entity"
import { TransformSystem } from "../Systems/TransformSystem";
import { AABBDrawableComponent } from "../Systems/DrawingSystem";
import { ClientConnectionSystem } from "../Systems/ClientConnectionSystem";
import * as WebSocket from 'websocket'
import { WorldSerializer } from "../Serialization/Serializer"
import { ScriptSystem } from "../Systems/ScriptSystem";
import { PlayerIdentity } from "../Scripts/Player/PlayerIdentity";
import { BasicMovement } from "../Scripts/Player/BasicMovement";
import { throws } from "assert";

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
        const world = entity.getWorld();

        const transform = new TransformSystem.Component(entity);
        world.transformSystem.registerComponent(transform);
        entity.registerComponent(transform);

        const drawable = new AABBDrawableComponent(entity,"C:\\User\\Latawiec");
        world.drawableSystem.registerComponent(drawable);
        entity.registerComponent(drawable);

        const playerInputController = new PlayerInputController(entity);
        world.scriptSystem.registerComponent(playerInputController);
        entity.registerComponent(playerInputController);

        const playerIdentity = new PlayerIdentity(entity, name);
        world.scriptSystem.registerComponent(playerIdentity);
        entity.registerComponent(playerIdentity);

        const movement = new BasicMovement(entity);
        world.scriptSystem.registerComponent(movement);
        entity.registerComponent(movement);

        // Remove self. My work is done.
        world.scriptSystem.unregisterComponent(this);
        entity.unregisterComponent(this);
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

                const playerEntity = this.createEntity();

                const connectionComponent = new ClientConnectionSystem.Component(playerEntity, regConnection);
                this.clientConnectionSystem.registerComponent(connectionComponent);
                playerEntity.registerComponent(connectionComponent);

                const initializationComponent = new TestPlayerInitializer(playerEntity);
                this.scriptSystem.registerComponent(initializationComponent);
                playerEntity.registerComponent(initializationComponent);

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