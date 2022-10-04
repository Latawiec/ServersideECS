import { ComponentBase } from "./Component";
import { UuidGenerator, Uuid } from "./UuidGenerator"

export type MetaName = string;

export abstract class SystemBase<Type extends ComponentBase> {
    private _IdComponentMap: Map<Readonly<Uuid>, Type> = new Map<Readonly<Uuid>, Type>()
    private _uuidGenerator: UuidGenerator = new UuidGenerator();

    registerComponent(component: Type): Uuid {
        return this._registerComponent(component);
    }

    unregisterComponent(component: Type): boolean {
        return this._unregisterComponent(component);
    }

    abstract get metaName(): MetaName;

    protected _registerComponent(component: Type): Uuid {
        if (component.systemAsignedId !== undefined) {
            debugger;
            console.error("Trying to register component that already has system-asigned ID (thus has been registered before");
            return component.systemAsignedId;
        }
        const componentId = this._uuidGenerator.getNext();
        this._IdComponentMap.set(componentId, component);

        return componentId;
    }

    protected _unregisterComponent(component: Readonly<Type>): boolean {
        if (component.systemAsignedId !== undefined && !this._IdComponentMap.has(component.systemAsignedId)) {
            // Bad bad... very bad
            debugger;
            console.error('Trying to unregister component %s with id %d which is not registered.', component.metaName, component.systemAsignedId);
            return false;
        }

        this._IdComponentMap.delete(component.systemAsignedId!);
        return true;
    }

    protected _getComponentsMap(): Map<Readonly<Uuid>, Type> {
        return this._IdComponentMap;
    }
}