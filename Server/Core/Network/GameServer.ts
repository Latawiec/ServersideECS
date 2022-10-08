import * as WebSocket from 'websocket'
import { Uuid, UuidGenerator } from "@core/Base/UuidGenerator";
import { ClientMessageRouter } from "./ClientMessageRouter";
import { GameRoom } from "./GameRoom";
import { CreateRoomRequest } from "@shared/Communication/Request/CreateRoomRequest";
import { JoinRoomRequest } from "@shared/Communication/Request/JoinRoomRequest";
import { ConnectionManager } from "./ConnectionManager";
import { ClientConnection } from './ClientConnection';


export class GameServer {
    private _gameRoomIdGenerator: UuidGenerator = new UuidGenerator();
    private _gameRooms: Map<Uuid, GameRoom>     = new Map();

    private _connectionIdRoomIdMap: Map<Uuid, Uuid> = new Map();

    private _connectionManager: ConnectionManager;
    private _gameServerMessageRouter: ClientMessageRouter;

    constructor(wsServer: WebSocket.server) {
        this._connectionManager = new ConnectionManager(wsServer);
        this._gameServerMessageRouter = new ClientMessageRouter();
        this.hookEvents();
    }

    get rooms(): Readonly<Map<Uuid, GameRoom>> {
        return this._gameRooms;
    }

    // Event handling
    hookEvents() {
        this._connectionManager.on('connectionCreated', (connection) => { this._gameServerMessageRouter.addConnection(connection) } );
        this._connectionManager.on('connectionClosed', (connection) => { this._gameServerMessageRouter.removeConnection(connection) } );

        this._gameServerMessageRouter.on('createRoom', (connection, message) => { this.createRoom(connection, message) } );
        this._gameServerMessageRouter.on('joinRoom', (connection, message) => { this.joinRoom(connection, message) } );
    }

    createRoom(connection: ClientConnection, message: CreateRoomRequest) {
        if (this._connectionIdRoomIdMap.has(connection.id)) {
            // This player is already in a room. Wtf?
        }

        const room = new GameRoom();
        this._gameRooms.set(this._gameRoomIdGenerator.getNext(), room);
    }

    joinRoom(connection: ClientConnection, message: JoinRoomRequest) {
        if (!this._gameRooms.has(message.roomId)) {
            // No such room available.
        }

        if (!this._connectionIdRoomIdMap.has(connection.id)) {
            // Player is already in a room.
        }

        this._gameRooms.get(message.roomId)!.addConnection(connection);
        this._connectionIdRoomIdMap.set(connection.id, message.roomId);
    }

    update() {
        for (const [id, gameRoom] of this._gameRooms) {
            gameRoom.update();
        }
    }
}