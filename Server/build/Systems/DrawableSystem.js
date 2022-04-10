"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawableSystem = exports.AABBDrawableComponent = exports.DrawableComponent = exports.DrawableTypes = void 0;
const System_1 = require("../Base/System");
var DrawableTypes;
(function (DrawableTypes) {
    DrawableTypes[DrawableTypes["AABBRect"] = 0] = "AABBRect";
})(DrawableTypes = exports.DrawableTypes || (exports.DrawableTypes = {}));
class DrawableComponent {
    constructor(owner) {
        this._isActive = true;
        this._systemAsignedId = undefined;
        this._assetsPaths = [];
        this._ownerEntity = owner;
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
        return DrawableComponent._componentId;
    }
    getAssetsPaths() {
        return this._assetsPaths;
    }
    get assetsPaths() {
        return this._assetsPaths;
    }
}
exports.DrawableComponent = DrawableComponent;
_a = DrawableComponent;
DrawableComponent._componentId = _a.name;
class AABBDrawableComponent extends DrawableComponent {
    constructor(entity, texturePath) {
        super(entity);
        this._width = 1.0;
        this._height = 1.0;
        this.assetsPaths.push(texturePath);
        this._assetPath = texturePath;
    }
    getType() {
        return DrawableTypes.AABBRect;
    }
}
exports.AABBDrawableComponent = AABBDrawableComponent;
class DrawableSystem extends System_1.System {
    registerComponent(component) {
        this._registerComponent(component);
        return component;
    }
    unregisterComponent(component) {
        this._unregisterComponent(component);
        return component;
    }
}
exports.DrawableSystem = DrawableSystem;
