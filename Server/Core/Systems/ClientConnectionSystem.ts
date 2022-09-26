import { ComponentBase, MetaName } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { SystemBase } from "../Base/System";
import { Uuid } from "../Base/UuidGenerator"
import * as WebSocket from 'websocket'
import { throws } from "assert";

export namespace ClientConnectionSystem {

    type IpAddress = string;


    export interface MessageListener {
        (message: any): void;
    }

    export class Connection {
        private _connection: WebSocket.connection;
        private _address: IpAddress;
        private _messageListeners: Array<(message: WebSocket.Message) => void>;
        
        constructor(connection: WebSocket.connection) {
            this._connection = connection;
            this._address = connection.socket.remoteAddress!;
            this._messageListeners = new Array();
        }
    
        receiveMessage(message: WebSocket.Message) {
            this._messageListeners.forEach(listener => {
                listener(message);
            });
        }
    
        pushMessage(message: any) {
            this._connection.send(message);
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

    export class Component implements ComponentBase {
        // Metadata
        static staticMetaName(): MetaName { return 'ClientConnectionSystem.Component' }

        private _ownerEntity: Entity;
        private _isActive: boolean = true;
        private _systemAsignedId: Uuid | undefined = undefined;
    
        private _connection: Connection;
        private _connectionListener: (message: WebSocket.Message) => void;
        // TODO: we need more than one listener.
        private _onMessageEvent: MessageListener | undefined = undefined;
    
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

        get systemMetaName(): MetaName {
            return System.staticMetaName();
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
        get metaName(): MetaName {
            return Component.staticMetaName();
        }
    
        set onMessage(event: (message: any) => void) {
            this._onMessageEvent = event;
        }
    };

    export class System extends SystemBase<Component> {
        // Metadata
        static staticMetaName(): MetaName { return 'ClientConnectionSystem.System' }

        // SystemBase implementation
        get metaName(): MetaName {
            return System.staticMetaName();
        }

        private _openConnections: Map<IpAddress, Connection>;

        constructor() {
            super();
            this._openConnections = new Map();        
        }
    
        registerComponent(component: Component): Component {
            this._registerComponent(component);
            return component;
        }
        unregisterComponent(component: Component): Component {
            this._unregisterComponent(component);
            return component;
        }
    
        registerConnection(inConnection: WebSocket.connection): Connection {
            var connection = new Connection(inConnection);
    
            const messagesListener = (msg: WebSocket.Message) => {
                connection.receiveMessage(msg);
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
    
        broadcastMessage(message: any) {
            this._openConnections.forEach((connection, key) => {
                connection.pushMessage(message);
            });
        }
    }

}; // namespace ClientConnectionSystem
