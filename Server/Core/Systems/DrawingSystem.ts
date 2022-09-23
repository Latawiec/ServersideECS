import { throws } from "assert";
import { ComponentBase, MetaName } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { SystemBase } from "../Base/System"
import { Uuid } from "../Base/UuidGenerator"
import { assert } from "console";
import { vec4 } from "gl-matrix";
import { Transform } from "../Base/Transform";
import { GlobalClock } from "@core/Base/GlobalClock";


export namespace DrawingSystem {

    export abstract class Component implements ComponentBase {
        // Metadata
        static staticMetaName(): MetaName { return 'DrawingSystem.Component' }

        private _assetsPaths: string[];
        private _ownerEntity: Entity;
        private _isActive: boolean = true;
        private _systemAsignedId: Uuid | undefined = undefined;
        private _transform: Transform;
        
        constructor(owner: Entity) {
            this._assetsPaths = [];
            this._ownerEntity = owner;
            this._transform = new Transform();
        }

        serialize(): Record<string, any> {
            let result: any = {};
            
            result.transform = this.transform.worldTransform;
            result.componentId = this.systemAsignedId;

            // TODO: I don't know how to handle type recognition on the other side.
            // Lets go with this for now...
            result.uniformParameters = {
                float:  {},
                vec2:   {},
                vec3:   {},
                vec4:   {},
                int:    {},
                ivec2:  {},
                ivec3:  {},
                ivec4:  {},
                mat4:   {}
            }

            return result;
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
    
        getAssetsPaths(): string[] {
            return this._assetsPaths;
        }

        get transform(): Transform {
            return this._transform;
        }
    
        protected get assetsPaths(): string[] {
            return this._assetsPaths;
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
