import { ComponentBase } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { SystemBase } from "../Base/System";
import { Uuid } from "../Base/UuidGenerator"


export namespace ScriptSystem {

    export abstract class Component implements ComponentBase {
        // Metadata 
        static staticMetaName(): string { return 'ScriptSystem.Component' }

        private _ownerEntity: Entity;
        private _isActive: boolean = true;
        private _systemAsignedId: Uuid | undefined = undefined;
    
        constructor(owner: Entity) {
            this._ownerEntity = owner;
        }

        serialize(output: Record<string, any>): Record<string, any> {
            // Do nothing
            return output
        }

        get systemMetaName(): string {
            return System.staticMetaName();
        }
    
        get isActive(): boolean {
            return this._isActive;
        }
        protected set isActive(value: boolean) {
            this._isActive;
        }
    
        get ownerEntity(): Entity {
            return this._ownerEntity;
        }
        get systemAsignedId(): Uuid | undefined {
            return this._systemAsignedId;
        }
        set systemAsignedId(value: Uuid | undefined) {
            this._systemAsignedId = value;
        }
        get metaName(): string {
            return Component.staticMetaName();
        }
    
        abstract preUpdate(): void;
        abstract onUpdate(): void;
        abstract postUpdate(): void;
    }


    export class System extends SystemBase<Component> {
        // Metadata
        static staticMetaName(): string { return 'ScriptSystem.System' }
    
        // SystemBase implementation
        get metaName(): string {
            return System.staticMetaName();
        }

        registerComponent(component: Component): Component {
            this._registerComponent(component);
            return component;
        }
        unregisterComponent(component: Component): Component {
            this._unregisterComponent(component);
            return component;
        }
    
        preUpdate(): void {
            this._getComponentsMap().forEach(entry => {
                entry.preUpdate();
            });
        }
    
        onUpdate(): void {
            this._getComponentsMap().forEach(entry => {
                entry.onUpdate();
            });
        }
    
        postUpdate(): void {
            this._getComponentsMap().forEach(entry => {
                entry.postUpdate();
            });
        }
    }

} // namespace Script System