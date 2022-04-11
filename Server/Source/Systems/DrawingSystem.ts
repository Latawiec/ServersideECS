import { throws } from "assert";
import { ComponentBase } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { SystemBase } from "../Base/System"
import { Uuid } from "../Base/UuidGenerator"


export namespace DrawingSystem {

    export enum Types {
        AABBRect
    }

    export abstract class Component implements ComponentBase {
        // Metadata
        static staticMetaName(): string { return 'DrawingSystem.Component' }

        private _assetsPaths: string[];
        private _ownerEntity: Entity;
        private _isActive: boolean = true;
        private _systemAsignedId: Uuid | undefined = undefined;
        
        constructor(owner: Entity) {
            this._assetsPaths = [];
            this._ownerEntity = owner;
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
    
        abstract getType(): Types;
    
        getAssetsPaths(): string[] {
            return this._assetsPaths;
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
    }

};



// Move it
export class AABBDrawableComponent extends DrawingSystem.Component {

    private _width: number = 1.0;
    private _height: number = 1.0;
    private _assetPath: string;

    constructor(entity: Entity, texturePath: string) {
        super(entity);
        this.assetsPaths.push(texturePath);
        this._assetPath = texturePath;
    }

    getType(): DrawingSystem.Types {
        return DrawingSystem.Types.AABBRect;
    }
}

