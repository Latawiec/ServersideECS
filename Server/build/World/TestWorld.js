"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestWorld = void 0;
const World_1 = require("./World");
const PlayerInputController_1 = require("../Scripts/Player/PlayerInputController");
const TransformSystem_1 = require("../Systems/TransformSystem");
const DrawableSystem_1 = require("../Systems/DrawableSystem");
const ClientConnectionSystem_1 = require("../Systems/ClientConnectionSystem");
const ScriptSystem_1 = require("../Systems/ScriptSystem");
const PlayerIdentity_1 = require("../Scripts/Player/PlayerIdentity");
const BasicMovement_1 = require("../Scripts/Player/BasicMovement");
class TestPlayerInitializer extends ScriptSystem_1.ScriptComponent {
    constructor(owner) {
        super(owner);
        this._connection = undefined;
        const connectionComponents = owner.getComponentsByType(ClientConnectionSystem_1.ClientConnectionComponent.name);
        if (connectionComponents.length === 0) {
            console.log(`%s could not be initialized. %s component required.`, TestPlayerInitializer.name, ClientConnectionSystem_1.ClientConnectionComponent.name);
        }
        // Assume one.
        this._connection = connectionComponents[0];
        var _this = this;
        this._connection.onMessage = function (message) {
            _this.filterMessage(message);
        };
    }
    preUpdate() {
    }
    onUpdate() {
    }
    postUpdate() {
    }
    filterMessage(message) {
        const connectionRequestProp = 'connectionRequest';
        const connectionRequestPlayerNameProp = 'playerName';
        if (message.hasOwnProperty(connectionRequestProp)) {
            const connectionRequest = message[connectionRequestProp];
            if (connectionRequest.hasOwnProperty(connectionRequestPlayerNameProp)) {
                console.log("Got request. Starting initialization...");
                this.initializePlayerEntity(connectionRequest[connectionRequestPlayerNameProp]);
            }
            else {
                console.log("Requested connection with no name?");
            }
        }
    }
    initializePlayerEntity(name) {
        const entity = this.ownerEntity;
        const world = entity.getWorld();
        const transform = new TransformSystem_1.TransformComponent(entity);
        world.transformSystem.registerComponent(transform);
        entity.registerComponent(transform);
        const drawable = new DrawableSystem_1.AABBDrawableComponent(entity, "C:\\User\\Latawiec");
        world.drawableSystem.registerComponent(drawable);
        entity.registerComponent(drawable);
        const playerInputController = new PlayerInputController_1.PlayerInputController(entity);
        world.scriptSystem.registerComponent(playerInputController);
        entity.registerComponent(playerInputController);
        const playerIdentity = new PlayerIdentity_1.PlayerIdentity(entity, name);
        world.scriptSystem.registerComponent(playerIdentity);
        entity.registerComponent(playerIdentity);
        const movement = new BasicMovement_1.BasicMovement(entity);
        world.scriptSystem.registerComponent(movement);
        entity.registerComponent(movement);
        // Remove self. My work is done.
        world.scriptSystem.unregisterComponent(this);
        entity.unregisterComponent(this);
    }
}
class TestWorld extends World_1.World {
    constructor(wsServer) {
        super();
        // 
        {
            wsServer.on('request', (req) => {
                const connection = req.accept(null, req.origin);
                console.log('Got a connection: ' + connection.socket.remoteAddress);
                if (this.clientConnectionSystem.hasConnection(connection.socket.remoteAddress)) {
                    console.log('This connection already exists.');
                    console.log('Will have to cover this somehow...');
                    // return;
                }
                const regConnection = this.clientConnectionSystem.registerConnection(connection);
                const playerEntity = this.createEntity();
                const connectionComponent = new ClientConnectionSystem_1.ClientConnectionComponent(playerEntity, regConnection);
                this.clientConnectionSystem.registerComponent(connectionComponent);
                playerEntity.registerComponent(connectionComponent);
                const initializationComponent = new TestPlayerInitializer(playerEntity);
                this.scriptSystem.registerComponent(initializationComponent);
                playerEntity.registerComponent(initializationComponent);
                connection.on('message', (message) => {
                    console.log('Received Message: ', message);
                    regConnection.pushMessage(message);
                });
                connection.on('close', (reasonCode, desc) => {
                    console.log('Client has disconnected');
                    this.clientConnectionSystem.removeConnection(connection);
                });
            });
        }
    }
}
exports.TestWorld = TestWorld;
