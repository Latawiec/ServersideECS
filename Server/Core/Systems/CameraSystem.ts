import { ComponentBase } from "../Base/Component"
import { Entity } from "../Base/Entity"
import { Uuid } from "../Base/UuidGenerator"
import { mat4 } from "gl-matrix";
import { Transform } from "../Base/Transform";
import { MetaName, SystemBase } from "@core/Base/System";
import { Serialization } from "@shared/WorldSnapshot";

export namespace CameraSystem {

    export class Component extends ComponentBase implements Serialization.ISnapshot<Serialization.Camera.Snapshot> {
        // Metadata
        static staticMetaName(): MetaName { return 'CameraSystem.Component' }

        private _transform = mat4.create();
        private _projection = mat4.create();

        takeSnapshot(): Serialization.Camera.Snapshot {
            const result = new Serialization.Camera.Snapshot();
            
            result.transform = Array.from(this.worldTransform);
            result.projection = Array.from(this.projection);

            return result;
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
            return mat4.mul(mat4.create(), this._transform, mat4.invert(mat4.create(), this.ownerEntity.transform.worldTransform));
        }
    }

    export class System extends SystemBase<Component> {
        // Metadata
        static staticMetaName(): MetaName { return 'CameraSystem.System' }

        // SystemBase implementation
        get metaName(): MetaName {
            return System.staticMetaName();
        }
    }
}
