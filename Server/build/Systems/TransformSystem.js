"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformSystem = exports.TransformComponent = void 0;
const System_1 = require("../Base/System");
class TransformComponent {
    constructor(owner) {
        this._isActive = true;
        this._systemAsignedId = undefined;
        this._ownerEntity = owner;
        this._position = [0, 0, 0];
        this._rotation = [0, 0, 0];
        this._scale = [0, 0, 0];
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
        return TransformComponent._componentId;
    }
    setPosition(newPosition) {
        this._position = newPosition;
    }
    get position() {
        return this._position;
    }
}
exports.TransformComponent = TransformComponent;
_a = TransformComponent;
TransformComponent._componentId = _a.name;
class TransformSystem extends System_1.System {
    registerComponent(component) {
        this._registerComponent(component);
        return component;
    }
    unregisterComponent(component) {
        this._unregisterComponent(component);
        return component;
    }
}
exports.TransformSystem = TransformSystem;
