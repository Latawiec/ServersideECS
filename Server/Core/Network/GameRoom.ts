import { Uuid } from "@core/Base/UuidGenerator";
import { World } from "@core/World/World";
import * as WebSocket from 'websocket'
import { ClientConnection } from "./ClientConnection";
import { ClientMessageRouter } from "./ClientMessageRouter";
import { GameConfigureRequest } from "@shared/Communication/Request/GameConfigureRequest"
import { TestWorld } from "@scripts/Worlds/TestWorld/TestWorld";
import { GameInputRequest } from "@shared/Communication/Request/GameInputRequest";
import { ClientConnectionSystem } from "@core/Systems/ClientConnectionSystem";
import { Serializer } from "@core/Serialization/Serializer"

export class GameRoom {
    private _world: World | undefined;
    private _isRunning: boolean = false;
    private _gameRoomMessageRouter: ClientMessageRouter;
    private _connectionIdComponentMap: Map<Uuid, ClientConnectionSystem.Component> = new Map();
    private _serializer = new Serializer();
    
    public gameMasterConnectionId: Uuid | undefined;

    constructor() {
        this._gameRoomMessageRouter = new ClientMessageRouter();
        this.hookEvents();
    }

    get world(): Readonly<World> | undefined {
        return this._world;
    }

    hookEvents() {
        this._gameRoomMessageRouter.on('leaveRoom', (connection) => { this.removeConnection(connection) });
        this._gameRoomMessageRouter.on('gameStart', (connection) => { this.start(connection) });
        this._gameRoomMessageRouter.on('gameConfig', (connection, request) => { this.configure(connection, request) });
        this._gameRoomMessageRouter.on('gameInput', (connection, request) => { this.playerInput(connection, request) });
    }

    configure(connection: ClientConnection, request: GameConfigureRequest) {
        // TODO: Replace with real world initialization based on configuration.
        const world = new TestWorld();
        this._world = world;
        this._connectionIdComponentMap.set(connection.id, world.createTestPlayer());
    }

    start(connection: ClientConnection) {
        if (!this._world) {
            // Starting a game without world set.
            return;
        }
        this._isRunning = true;
    }

    playerInput(connection: ClientConnection, request: GameInputRequest) {
        if (!this._connectionIdComponentMap.has(connection.id)) {
            // We got input from a player that isn't in the room.
            return;
        }
        
        const connectionComponent = this._connectionIdComponentMap.get(connection.id)!;

        if (request.keyPressed) {
            connectionComponent.emit('keyPressed', request.keyPressed)
        }

        if (request.keyReleased) {
            connectionComponent.emit('keyReleased', request.keyReleased);
        }
    }

    addConnection(connection: ClientConnection) {
        this._gameRoomMessageRouter.addConnection(connection);
        if (this.gameMasterConnectionId === undefined) {
            // First person to join. They are now the Game Master.
            this.gameMasterConnectionId = connection.id;
        }
    }

    removeConnection(connection: ClientConnection) {
        this._gameRoomMessageRouter.removeConnection(connection);
        if (this.gameMasterConnectionId && connection.id === this.gameMasterConnectionId) {
            // Game master lost. Give it to someone else.
        }
    }

    update() {
        if (this._isRunning) {
            this._world!.update();
            this._serializer.update(this._world!);
            this._gameRoomMessageRouter.broadcast(this._serializer.toJson());
        }
    }
}