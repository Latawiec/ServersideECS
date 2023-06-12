import { EventEmitter } from "stream";
import { ClientConnection } from "./ClientConnection";
import { WebSocketServer } from "ws";
import { Uuid, UuidGenerator } from "@core/Base/UuidGenerator";

export class ConnectionManager extends EventEmitter {
    private _connectionIdGenerator: UuidGenerator = new UuidGenerator();
    private _connections: Map<Uuid, ClientConnection> = new Map();

    private _wsServer;

    constructor(webSocketServer: WebSocketServer) {
        super();
        this._wsServer = webSocketServer;

        this._wsServer.on('connection', (ws, req) => {
            const address = req.socket.remoteAddress!;
            const connectionId = this._connectionIdGenerator.getNext();

            const clientConnection = new ClientConnection(ws, connectionId, address);

            clientConnection.on('close', (code: number, desc: string) => {
                this._connections.delete(clientConnection.id);
                this.emit('connectionClosed', clientConnection);
            });

            this._connections.set(connectionId, clientConnection);
            this.emit('connectionCreated', clientConnection);
        })
    }

    // Events
    on(event: 'connectionCreated', cb: (connection: ClientConnection) => void): this;
    on(event: 'connectionClosed', cb: (connection: ClientConnection) => void): this;
    on(event: string, cb: (...args: any[]) => void): this {
        return super.on(event, cb);
    }

    addListener(event: 'connectionCreated', cb: (connection: ClientConnection) => void): this;
    addListener(event: 'connectionClosed', cb: (connection: ClientConnection) => void): this;
    addListener(event: string, cb: (...args: any[])=>void): this {
        return super.addListener(event, cb);
    }
}