import { Entity } from "./Entity"
import { ComponentBase } from "./Component";
import { UuidGenerator, Uuid } from "./UuidGenerator"

export type MetaName = string;

export abstract class SystemBase<Type extends ComponentBase> {
    private _IdComponentMap: Map<Readonly<Uuid>, Type> = new Map<Readonly<Uuid>, Type>()
    private _uuidGenerator: UuidGenerator = new UuidGenerator();

    abstract registerComponent(component: Type): Type;
    abstract unregisterComponent(component: Type): Type;

    abstract get metaName(): MetaName;

    protected _registerComponent(component: Type): void {
        const componentId = this._uuidGenerator.getNext();
        component.systemAsignedId = componentId;
        this._IdComponentMap.set(componentId, component);
    }

    protected _unregisterComponent(component: Readonly<Type>): void {
        if (component.systemAsignedId !== undefined && !this._IdComponentMap.has(component.systemAsignedId)) {
            // Bad bad... very bad
            debugger;
            console.error('Trying to unregister component %s with id %d which is not registered.', component.metaName, component.systemAsignedId);
            return;
        }

        this._IdComponentMap.delete(component.systemAsignedId!);
    }

    protected _getComponentsMap(): Map<Readonly<Uuid>, Type> {
        return this._IdComponentMap;
    }
}