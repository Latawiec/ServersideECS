import { vec3 } from "gl-matrix";
import { ComponentBase } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { SystemBase } from "../Base/System";
import { Uuid } from "../Base/UuidGenerator"


export namespace TransformSystem {

    export class Component implements ComponentBase {
        // Metadata
        static staticMetaName(): string { return 'TransformSystem.Component' }

        private _ownerEntity: Entity;
        private _isActive: boolean = true;
        private _systemAsignedId: Uuid | undefined = undefined;
    
        private _position: vec3
        private _rotation: vec3
        private _scale: vec3
    
        constructor(owner: Entity) {
            this._ownerEntity = owner;
            this._position = [0, 0, 0];
            this._rotation = [0, 0, 0];
            this._scale = [0, 0, 0];
        }

        get systemMetaName(): string {
            return System.staticMetaName();
        }
    
        get isActive(): boolean {
            return this._isActive;
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
    
        setPosition(newPosition: vec3) {
            this._position = newPosition;
        }
    
        get position(): Readonly<vec3> {
            return this._position;
        }
    }

    export class System extends SystemBase<Component> {
        // Metadata
        static staticMetaName(): string { return 'TransformSystem.System' }

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
    }

} // namespace TransformSystem




