import { EventEmitter } from "stream";
import { ClientRequest, ClientRequestType } from "@shared/Communication/Request/ClientRequest";
import { CloseRequest } from "@shared/Communication/Request/CloseRequest";
import { CreateRoomRequest } from "@shared/Communication/Request/CreateRoomRequest";
import { GameInputRequest } from "@shared/Communication/Request/GameInputRequest";
import { GameStartRequest } from "@shared/Communication/Request/GameStartRequest";
import { JoinRoomRequest } from "@shared/Communication/Request/JoinRoomRequest";
import { ClientConnection } from "./ClientConnection";
import { Uuid } from "@core/Base/UuidGenerator";
import { GameConfigureRequest } from "@shared/Communication/Request/GameConfigureRequest";
import { LeaveRoomRequest } from "@shared/Communication/Request/LeaveRoomRequest";


export class ClientMessageRouter extends EventEmitter {
    private _connections: Map<Uuid, ClientConnection> = new Map();

    addConnection(connection: ClientConnection) {
        this._connections.set(connection.id, connection);
        connection.addListener('message', (message) => { this.emitMessage(connection, message) } );
    }

    removeConnection(connection: ClientConnection) {
        this._connections.delete(connection.id);
        connection.addListener('close', (code: number, desc: string) => { this.emitClose(connection, code, desc) });
    }

    emitMessage(connection: ClientConnection, request: ClientRequest): void {
        switch(request.type) {
            case ClientRequestType.CreateRoom:
                this.emit('createRoom', connection, request as CreateRoomRequest);
                break;
            case ClientRequestType.JoinRoom:
                this.emit('joinRoom', connection, request as JoinRoomRequest);
                break;
            case ClientRequestType.LeaveRoom:
                this.emit('leaveRoom', connection, request as LeaveRoomRequest);
                break;
            case ClientRequestType.GameConfig:
                this.emit('gameConfig', connection, request as GameConfigureRequest);
                break;
            case ClientRequestType.GameInput:
                this.emit('gameInput', connection, request as GameInputRequest);
                break;
            case ClientRequestType.GameStart:
                this.emit('gameStart', connection, request as GameStartRequest);
            default:
                console.log(`Unhandled message: ${0}`, request);
        }
    }

    emitClose(connection: ClientConnection, code: number, desc: string) {
        const request = new CloseRequest();
        this.emit('close', connection, request);
    }

    broadcast(data: any) {
        for(const [key, value] of this._connections) {
            // TODO: client specific data.
            value.send(data);
        }
    }

    // Events
    on(event: 'createRoom', cb: (connection: ClientConnection, message: CreateRoomRequest) => void): this;
    on(event: 'joinRoom',   cb: (connection: ClientConnection, message: JoinRoomRequest) => void): this;
    on(event: 'leaveRoom',  cb: (connection: ClientConnection, message: JoinRoomRequest) => void): this;
    on(event: 'gameConfig', cb: (connection: ClientConnection, message: GameConfigureRequest) => void): this;
    on(event: 'gameInput',  cb: (connection: ClientConnection, message: GameInputRequest) => void): this;
    on(event: 'gameStart',  cb: (connection: ClientConnection, message: GameStartRequest) => void): this;
    on(event: 'close',      cb: (connection: ClientConnection, message: CloseRequest) => void): this;
    on(event: string, cb: (...args: any[]) => void): this {
        return super.on(event, cb)
    }

    addListener(event: 'createRoom',    cb: (connection: ClientConnection, message: CreateRoomRequest) => void): this;
    addListener(event: 'joinRoom',      cb: (connection: ClientConnection, message: JoinRoomRequest) => void): this;
    addListener(event: 'leaveRoom',     cb: (connection: ClientConnection, message: JoinRoomRequest) => void): this;
    addListener(event: 'gameConfig',    cb: (connection: ClientConnection, message: GameConfigureRequest) => void): this;
    addListener(event: 'gameInput',     cb: (connection: ClientConnection, message: GameInputRequest) => void): this;
    addListener(event: 'gameStart',     cb: (connection: ClientConnection, message: GameStartRequest) => void): this;
    addListener(event: 'close',         cb: (connection: ClientConnection, message: CloseRequest) => void): this;
    addListener(event: string, cb: (...args: any[])=>void): this {
        return super.addListener(event, cb);
    }
}