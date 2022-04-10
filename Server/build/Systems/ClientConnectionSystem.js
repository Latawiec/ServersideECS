"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientConnectionSystem = exports.ClientConnectionComponent = void 0;
const System_1 = require("../Base/System");
class ClientConnectionComponent {
    constructor(owner, connection) {
        this._isActive = true;
        this._systemAsignedId = undefined;
        this._onMessageEvent = undefined;
        this._ownerEntity = owner;
        this._connection = connection;
        var _this = this;
        this._connectionListener = function (message) {
            if (_this.isActive && _this._onMessageEvent !== undefined) {
                try {
                    const obj = JSON.parse(message === null || message === void 0 ? void 0 : message.utf8Data);
                    _this._onMessageEvent(obj);
                }
                catch (a) {
                    console.error(a);
                }
            }
        };
        this._connection.addListener(this._connectionListener);
    }
    get isActive() {
        return this._isActive;
    }
    get ownerEntity() {
        return this._ownerEntity;
    }
    get systemAsignedId() {
        return this._systemAsignedId;
    }
    set systemAsignedId(value) {
        this._systemAsignedId = value;
    }
    get metaName() {
        return ClientConnectionComponent._componentId;
    }
    set onMessage(event) {
        this._onMessageEvent = event;
    }
}
exports.ClientConnectionComponent = ClientConnectionComponent;
_a = ClientConnectionComponent;
ClientConnectionComponent._componentId = _a.name;
;
class Connection {
    constructor(connection) {
        this._address = connection.socket.remoteAddress;
        this._messageListeners = new Array();
    }
    pushMessage(message) {
        this._messageListeners.forEach(listener => {
            listener(message);
        });
    }
    addListener(listener) {
        this._messageListeners.push(listener);
    }
    removeListener(listener) {
        var index = this._messageListeners.indexOf(listener, 0);
        if (index > -1) {
            this._messageListeners.splice(index, 1);
        }
    }
    get address() {
        return this._address;
    }
}
class ClientConnectionSystem extends System_1.System {
    constructor() {
        super();
        this._openConnections = new Map();
    }
    registerComponent(component) {
        this._registerComponent(component);
        return component;
    }
    unregisterComponent(component) {
        this._unregisterComponent(component);
        return component;
    }
    registerConnection(inConnection) {
        var connection = new Connection(inConnection);
        const messagesListener = (msg) => {
            connection.pushMessage(msg);
        };
        inConnection.addListener('close', (reasonCode, description) => {
            inConnection.removeListener('message', messagesListener);
        });
        inConnection.addListener('message', messagesListener);
        this._openConnections.set(inConnection.socket.remoteAddress, connection);
        return connection;
    }
    hasConnection(_address) {
        console.log(JSON.stringify(this._openConnections));
        return this._openConnections.has(_address);
    }
    removeConnection(connection) {
    }
}
exports.ClientConnectionSystem = ClientConnectionSystem;
