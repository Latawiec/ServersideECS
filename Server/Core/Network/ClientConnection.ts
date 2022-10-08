import { EventEmitter } from 'stream';
import { Uuid } from "@core/Base/UuidGenerator";
import * as WebSocket from 'websocket'
import { ClientRequest } from '@shared/Communication/Request/ClientRequest';

type IpAddress = string;

export class ClientConnection extends EventEmitter {
    private _connection: WebSocket.connection;
    private _address: IpAddress;
    private _id: Uuid;

    constructor(connection: WebSocket.connection, id: Uuid) {
        super();
        this._id = id;

        this._connection = connection;
        this._address = connection.socket.remoteAddress!;
        // TODO: better type checking if message is correct.
        this._connection.on('message', (data: WebSocket.Message) => { this.emit('message', JSON.parse((data as WebSocket.IUtf8Message).utf8Data))})
        this._connection.on('close', (code: number, desc: string) => { this.emit('close', code, desc) })
    }

    // Events
    on(event: 'message', cb: (data: ClientRequest) => void): this;
    on(event: 'close', cb: (code: number, desc: string) => void): this;
    on(event: string, cb: (...args: any[]) => void): this {
        return super.on(event, cb)
    }

    addListener(event: 'message', cb: (data: ClientRequest) => void): this;
    addListener(event: 'close', cb: (code: number, desc: string) => void): this;
    addListener(event: string, cb: (...args: any[])=>void): this {
        return super.addListener(event, cb);
    }

    send(data: any) {
        this._connection.send(data);
    }

    get address(): Readonly<IpAddress> {
        return this._address;
    }

    get id(): Readonly<Uuid> {
        return this._id;
    }
}