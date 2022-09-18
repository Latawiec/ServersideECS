import { ComponentBase, MetaName } from "../Base/Component"
import { Entity } from "../Base/Entity"
import { Uuid } from "../Base/UuidGenerator"
import { mat4 } from "gl-matrix";
import { Transform } from "../Base/Transform";
import { SystemBase } from "@core/Base/System";

export namespace CameraSystem {

    export class Component implements ComponentBase {
        // Metadata
        static staticMetaName(): MetaName { return 'CameraSystem.Component' }

        private _ownerEntity: Entity;
        private _isActive: boolean = true;
        private _systemAsignedId: Uuid | undefined = undefined;
        private _transform: mat4;
        private _projection: mat4;

        constructor(owner: Entity) {
            this._ownerEntity = owner;
            this._transform = mat4.create();
            this._projection = mat4.create();
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

        get systemMetaName(): string {
            return System.staticMetaName();
        }

        set transform(newTransform: mat4) {
            this._transform = newTransform;
        }

        get transform() : mat4 {
            return this._transform;
        }

        set projection(newProjection: mat4) {
            this._projection = newProjection
        }

        get projection() : mat4 {
            return this._projection;
        }

        get worldTransform() : mat4 {
            return mat4.mul(mat4.create(), this.ownerEntity.getTransform().worldTransform, this._transform);
        }

        serialize(output: Record<string, any>): Record<string, any> {
            const result: Record<string, any> = {
                transform: this.worldTransform,
                projection: this.projection
            }

            output.camera = result;
            return result;
        }
    }

    export class System extends SystemBase<Component> {
        // Metadata
        static staticMetaName(): MetaName { return 'CameraSystem.System' }

        // SystemBase implementation
        get metaName(): MetaName {
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
}
