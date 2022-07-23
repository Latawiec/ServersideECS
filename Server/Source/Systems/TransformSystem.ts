import { throws } from "assert";
import { vec3, mat4 } from "gl-matrix";
import { runInThisContext } from "vm";
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
    
        private _position: vec3;
        private _rotation: vec3;
        private _scale: vec3;

        private _worldTransform: mat4;
    
        constructor(owner: Entity) {
            this._ownerEntity = owner;
            this._position = [0, 0, 0];
            this._rotation = [0, 0, 0];
            this._scale = [1, 1, 1];

            this._worldTransform = mat4.create();
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

        setRotation(newRotation: vec3) {
            this._rotation = newRotation
        }

        get rotation(): Readonly<vec3> {
            return this._rotation;
        }

        setScale(newScale: vec3) {
            this._scale = newScale;
        }

        get scale(): Readonly<vec3> {
            return this._scale;
        }

        updateWorldTransform(parentWorldTransform: Readonly<mat4>) : Readonly<mat4> {
            this._worldTransform = mat4.create();
            mat4.scale(this._worldTransform, this._worldTransform, this._scale);
            mat4.rotateX(this._worldTransform, this._worldTransform, this._rotation[0]);
            mat4.rotateY(this._worldTransform, this._worldTransform, this._rotation[1]);
            mat4.rotateZ(this._worldTransform, this._worldTransform, this._rotation[2]);
            mat4.translate(this._worldTransform, this._worldTransform, this._position);
            
            this._worldTransform = mat4.mul(this._worldTransform, parentWorldTransform, this._worldTransform);
            return this._worldTransform;
        }
        
        get worldTransform(): Readonly<mat4> {
            return this._worldTransform;
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

        updateWorldTransforms(rootEntity: Readonly<Entity>, parentTransform: Readonly<mat4> = mat4.create()) {
            
            let entityTransform: Readonly<mat4> | undefined = undefined;
            const entityTransforms = rootEntity.getComponentsByType(Component.staticMetaName());
            if (entityTransforms.length != 0) {
                const entityTransformComponent = entityTransforms[0] as TransformSystem.Component;
                entityTransform = entityTransformComponent.updateWorldTransform(parentTransform);
            } else {
                // Entity breaks transform hierarchy. Reset!
                entityTransform = mat4.create();
            }

            for (const entity of rootEntity.getChildren())
            {
                this.updateWorldTransforms(entity, entityTransform);
            }
        }
    }

} // namespace TransformSystem




