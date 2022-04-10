import { Component } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { System } from "../Base/System";
import { Uuid } from "../Base/UuidGenerator"
import * as WebSocket from 'websocket'
import { throws } from "assert";

type IpAddress = string;

export interface OnMessage {
    (message: any): void;
}

export class ClientConnectionComponent implements Component {
    private static _componentId: string = this.name;
    private _ownerEntity: Entity;
    private _isActive: boolean = true;
    private _systemAsignedId: Uuid | undefined = undefined;

    private _connection: Connection;
    private _connectionListener: (message: WebSocket.Message) => void;
    private _onMessageEvent: OnMessage | undefined = undefined;

    constructor(owner: Entity, connection: Connection) {
        this._ownerEntity = owner;
        this._connection = connection;

        var _this = this;
        this._connectionListener = function (message: WebSocket.Message) {
            if (_this.isActive && _this._onMessageEvent !== undefined) {
                try {
                    const obj = JSON.parse((message as WebSocket.IUtf8Message)?.utf8Data);
                    _this._onMessageEvent(obj);
                } catch (a) {
                    console.error(a)
                }
            }
        }    
        this._connection.addListener(this._connectionListener);    
    }

    get isActive(): boolean {
        return this._isActive;
    }
    get ownerEntity(): Entity {
        return this._ownerEntity;
    }
    get systemAsignedId(): number | undefined {
        return this._systemAsignedId;
    }
    set systemAsignedId(value: number | undefined) {
        this._systemAsignedId = value;
    }
    get metaName(): string {
        return ClientConnectionComponent._componentId;
    }

    set onMessage(event: (message: any) => void) {
        this._onMessageEvent = event;
    }
};


class Connection {
    private _address: IpAddress;
    private _messageListeners: Array<(message: WebSocket.Message) => void>;
    
    constructor(connection: WebSocket.connection) {
        this._address = connection.socket.remoteAddress!;
        this._messageListeners = new Array();
    }

    pushMessage(message: WebSocket.Message) {
        this._messageListeners.forEach(listener => {
            listener(message);
        });
    }

    addListener(listener: (message: WebSocket.Message) => void) {
        this._messageListeners.push(listener);
    }

    removeListener(listener: (message: WebSocket.Message) => void) {
        var index: number = this._messageListeners.indexOf(listener, 0);
        if (index > -1 ) {
            this._messageListeners.splice(index, 1);
        }
    }

    get address() {
        return this._address;
    }
}

export class ClientConnectionSystem extends System<ClientConnectionComponent> {
    private _openConnections: Map<IpAddress, Connection>;

    constructor() {
        super();
        this._openConnections = new Map();
        
    }

    registerComponent(component: ClientConnectionComponent): ClientConnectionComponent {
        this._registerComponent(component);
        return component;
    }
    unregisterComponent(component: ClientConnectionComponent): ClientConnectionComponent {
        this._unregisterComponent(component);
        return component;
    }

    registerConnection(inConnection: WebSocket.connection): Connection {
        var connection = new Connection(inConnection);

        const messagesListener = (msg: WebSocket.Message) => {
            connection.pushMessage(msg);
        };

        inConnection.addListener('close', (reasonCode, description) => {
            inConnection.removeListener('message', messagesListener);
        });

        inConnection.addListener('message', messagesListener);

        this._openConnections.set(inConnection.socket.remoteAddress!, connection);

        return connection;
    }

    hasConnection(_address: IpAddress) {
        console.log(JSON.stringify(this._openConnections));
        return this._openConnections.has(_address);
    }

    removeConnection(connection: WebSocket.connection) {

    }
}