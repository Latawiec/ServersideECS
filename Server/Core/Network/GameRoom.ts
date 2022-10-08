import { Uuid } from "@core/Base/UuidGenerator";
import { World } from "@core/World/World";
import * as WebSocket from 'websocket'
import { ClientConnection } from "./ClientConnection";
import { ClientMessageRouter } from "./ClientMessageRouter";
import { GameConfigureRequest } from "@shared/Communication/Request/GameConfigureRequest"
import { GameUpdateResponse } from "@shared/Communication/Response/GameUpdateResponse"
import { GamePreparationResponse } from "@shared/Communication/Response/GamePreparationResponse"
import { TestWorld } from "@scripts/Worlds/TestWorld/TestWorld";
import { GameInputRequest } from "@shared/Communication/Request/GameInputRequest";
import { ClientConnectionSystem } from "@core/Systems/ClientConnectionSystem";
import { Serializer } from "@core/Serialization/Serializer"
import { GamePreparationRequest } from "@shared/Communication/Request/GamePreparationRequest";

export class GameRoom {
    private _world: World | undefined;
    private _isRunning: boolean = false;
    private _isPreparing: boolean = false;
    private _gameRoomMessageRouter: ClientMessageRouter;
    private _connectionIdComponentMap: Map<Uuid, ClientConnectionSystem.Component> = new Map();
    private _serializer = new Serializer();

    private _clientsPreparationStatus: Map<Uuid, boolean> = new Map();
    
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
        this._gameRoomMessageRouter.on('gamePreparation', (connection, request) => { this.preparation(connection, request)})
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

        if (this._isRunning) {
            // It's already runnig.
            return;
        }

        this._isPreparing = true;
        this._clientsPreparationStatus.clear();

        const response = new GamePreparationResponse();
        response.requiredAssetsPath = this._world.assetManager.assetsPackagePath;

        this._gameRoomMessageRouter.broadcast(JSON.stringify(response))
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

    preparation(connection: ClientConnection, request: GamePreparationRequest) {
        debugger;
        if (!this._isPreparing || this._isRunning) {
            // We're not preparing the game.
            return;
        }

        // TODO: Verify all players in game.
        if (request.assetsReady) {
            this._isPreparing = false;
            this._isRunning = true;
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
            const response = new GameUpdateResponse();
            response.data = this._serializer.asSnapshot();
            this._gameRoomMessageRouter.broadcast(JSON.stringify(response));
        }
    }
}