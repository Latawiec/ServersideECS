import { throws } from "assert";
import { ComponentBase, MetaName } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { SystemBase } from "../Base/System"
import { Uuid } from "../Base/UuidGenerator"
import { assert } from "console";
import { vec4 } from "gl-matrix";
import { Transform } from "../Base/Transform";
import { GlobalClock } from "@core/Base/GlobalClock";
import { Serialization } from "@shared/WorldSnapshot";


export namespace DrawingSystem {

    enum Blending {
        Transparency,
        Opaque,
        Additive,
    };

    export abstract class Component implements ComponentBase, Serialization.ISnapshot<Serialization.Drawable.Snapshot> {
        // Metadata
        static staticMetaName(): MetaName { return 'DrawingSystem.Component' }

        private _ownerEntity: Entity;
        private _systemAsignedId: Uuid | undefined = undefined;
        private _transform: Transform;
        
        isActive: boolean = true;
        blending: Blending = Blending.Transparency;

        constructor(owner: Entity) {
            this._ownerEntity = owner;
            this._transform = new Transform();
        }

        takeSnapshot(): Serialization.Drawable.Snapshot {
            const result = new Serialization.Drawable.Snapshot();

            result.transform = Array.from(this.transform.worldTransform);

            return result;
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

        get transform(): Transform {
            return this._transform;
        }
    }

    export class System extends SystemBase<Component> {
        // Metaname 
        static staticMetaName(): string { return 'DrawingSystem.System' }

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

        update() {
            for(const componentEntry of this._getComponentsMap()) 
            {
                const component = componentEntry[1] as DrawingSystem.Component;
                component.transform.updateWorldTransform(component.ownerEntity.transform.worldTransform);
            }
        }
    }

};
