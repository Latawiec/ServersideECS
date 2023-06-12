import { EventEmitter } from 'stream';
import { Uuid } from "@core/Base/UuidGenerator";
import WebSocket = require('ws');

type IpAddress = string;

export class ClientConnection extends EventEmitter {
    private _connection: WebSocket;
    private _address: IpAddress;
    private _id: Uuid;

    constructor(connection: WebSocket, id: Uuid, address: string) {
        super();
        this._id = id;

        this._connection = connection;
        this._address = address
        // TODO: better type checking if message is correct.
        this._connection.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
            if (isBinary) {
                this.emit('binaryMessage', data);
            } else {
                this.emit('objectMessage', JSON.parse(data.toString()));
            }
        });
        this._connection.on('close', (code: number, reason: Buffer) => { this.emit('close', code, reason) })
    }

    // Events
    on(event: 'binaryMessage', cb: (data: Buffer) => void): this;
    on(event: 'objectMessage', cb: (data: any) => void): this;
    on(event: 'close', cb: (code: number, desc: string) => void): this;
    on(event: string, cb: (...args: any[]) => void): this {
        return super.on(event, cb)
    }

    addListener(event: 'binaryMessage', cb: (data: Buffer) => void): this;
    addListener(event: 'objectMessage', cb: (data: any) => void): this;
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