"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.System = void 0;
const UuidGenerator_1 = require("./UuidGenerator");
class System {
    constructor() {
        this._IdComponentMap = new Map();
        this._uuidGenerator = new UuidGenerator_1.UuidGenerator();
    }
    _registerComponent(component) {
        const componentId = this._uuidGenerator.getNext();
        component.systemAsignedId = componentId;
        this._IdComponentMap.set(componentId, component);
    }
    _unregisterComponent(component) {
        if (component.systemAsignedId !== undefined && !this._IdComponentMap.has(component.systemAsignedId)) {
            // Bad bad... very bad
            console.error('Trying to unregister component %s with id %d which is not registered.', component.metaName, component.systemAsignedId);
            return;
        }
        this._IdComponentMap.delete(component.systemAsignedId);
    }
    _getComponentsMap() {
        return this._IdComponentMap;
    }
}
exports.System = System;
