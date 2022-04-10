"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.World = void 0;
const Entity_1 = require("../Base/Entity");
const UuidGenerator_1 = require("../Base/UuidGenerator");
const TransformSystem_1 = require("../Systems/TransformSystem");
const ScriptSystem_1 = require("../Systems/ScriptSystem");
const DrawableSystem_1 = require("../Systems/DrawableSystem");
const ClientConnectionSystem_1 = require("../Systems/ClientConnectionSystem");
class World {
    constructor() {
        this._entityUuidGenerator = new UuidGenerator_1.UuidGenerator();
        this._transformSystem = new TransformSystem_1.TransformSystem();
        this._scriptSystem = new ScriptSystem_1.ScriptSystem();
        this._drawableSystem = new DrawableSystem_1.DrawableSystem();
        this._clientConnectionSystem = new ClientConnectionSystem_1.ClientConnectionSystem();
        this._rootNode = new Entity_1.Entity(this, undefined, this._entityUuidGenerator.getNext());
        this._entities = [this._rootNode];
    }
    createEntity(parent) {
        var result = new Entity_1.Entity(this, parent ? parent : this._rootNode, this._entityUuidGenerator.getNext());
        this._entities.push(result);
        return result;
    }
    getRoot() {
        return this._rootNode;
    }
    getEntites() {
        return this._entities;
    }
    update() {
        this._scriptSystem.onUpdate();
    }
    get scriptSystem() {
        return this._scriptSystem;
    }
    get transformSystem() {
        return this._transformSystem;
    }
    get drawableSystem() {
        return this._drawableSystem;
    }
    get clientConnectionSystem() {
        return this._clientConnectionSystem;
    }
}
exports.World = World;
