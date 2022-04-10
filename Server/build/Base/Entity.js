"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
class Entity {
    constructor(world, parent, uuid) {
        this._componentsMap = new Map();
        this._world = world;
        this._parent = parent;
        this._children = [];
        this._uuid = uuid;
    }
    getComponents() {
        return this._componentsMap;
    }
    getComponentsByType(name) {
        if (this._componentsMap.has(name)) {
            return this._componentsMap.get(name);
        }
        return [];
    }
    registerComponent(component) {
        var _a;
        if (!this._componentsMap.has(component.metaName)) {
            this._componentsMap.set(component.metaName, []);
        }
        (_a = this._componentsMap.get(component.metaName)) === null || _a === void 0 ? void 0 : _a.push(component);
    }
    unregisterComponent(component) {
        if (this._componentsMap.has(component.metaName)) {
            var index = this._componentsMap.get(component.metaName).indexOf(component, 0);
            if (index > -1) {
                this._componentsMap.get(component.metaName).splice(index, 1);
            }
        }
    }
    getChildren() {
        return this._children;
    }
    getParent() {
        return this._parent ? this._parent : undefined;
    }
    getUuid() {
        return this._uuid;
    }
    getWorld() {
        return this._world;
    }
}
exports.Entity = Entity;
