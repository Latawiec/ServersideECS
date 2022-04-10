"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptSystem = exports.ScriptComponent = void 0;
const System_1 = require("../Base/System");
class ScriptComponent {
    constructor(owner) {
        this._isActive = true;
        this._systemAsignedId = undefined;
        this._ownerEntity = owner;
    }
    get isActive() {
        return this._isActive;
    }
    set isActive(value) {
        this._isActive;
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
        return ScriptComponent._componentId;
    }
}
exports.ScriptComponent = ScriptComponent;
_a = ScriptComponent;
ScriptComponent._componentId = _a.name;
class ScriptSystem extends System_1.System {
    registerComponent(component) {
        this._registerComponent(component);
        return component;
    }
    unregisterComponent(component) {
        this._unregisterComponent(component);
        return component;
    }
    preUpdate() {
        this._getComponentsMap().forEach(entry => {
            entry.preUpdate();
        });
    }
    onUpdate() {
        this._getComponentsMap().forEach(entry => {
            entry.onUpdate();
        });
    }
    postUpdate() {
        this._getComponentsMap().forEach(entry => {
            entry.postUpdate();
        });
    }
}
exports.ScriptSystem = ScriptSystem;
