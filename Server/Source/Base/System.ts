import { Entity } from "./Entity"
import { Component } from "./Component";
import { UuidGenerator, Uuid } from "./UuidGenerator"

export abstract class System<Type extends Component> {
    private _IdComponentMap: Map<Readonly<Uuid>, Type> = new Map<Readonly<Uuid>, Type>()
    private _uuidGenerator: UuidGenerator = new UuidGenerator();

    abstract registerComponent(component: Type): Type;
    abstract unregisterComponent(component: Type): Type;

    protected _registerComponent(component: Type): void {
        const componentId = this._uuidGenerator.getNext();
        component.systemAsignedId = componentId;
        this._IdComponentMap.set(componentId, component);
    }

    protected _unregisterComponent(component: Readonly<Type>): void {
        if (component.systemAsignedId !== undefined && !this._IdComponentMap.has(component.systemAsignedId)) {
            // Bad bad... very bad
            console.error('Trying to unregister component %s with id %d which is not registered.', component.metaName, component.systemAsignedId);
            return;
        }

        this._IdComponentMap.delete(component.systemAsignedId!);
    }

    protected _getComponentsMap(): Map<Readonly<Uuid>, Type> {
        return this._IdComponentMap;
    }
}