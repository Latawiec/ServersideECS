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

    export enum Types {

        AABBRect,
        SpriteTexture,

        AOE_CircleClosed,
        AOE_RectangleClosed,
        AOE_CircleOpen,
        Unknown,
    }

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

        serialize(output: Record<string, any>): Record<string, any> {
            let result: any = {};
            
            result.transform = this.transform.worldTransform;
            result.type = this.getType();
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

            output.drawableComponent = result;
            return output.drawableComponent;
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

// Move it
export class AABBDrawableComponent extends DrawingSystem.Component {

    private _width: number = 1.0;
    private _height: number = 1.0;
    private _assetPath: string;
    private _color: vec4 = [0, 0, 0, 0];

    constructor(entity: Entity, texturePath: string) {
        super(entity);
        this.assetsPaths.push(texturePath);
        this._assetPath = texturePath;
    }

    getType(): DrawingSystem.Types {
        return DrawingSystem.Types.AABBRect;
    }

    get color(): vec4 {
        return this._color;
    }

    set color(color: vec4) {
        this._color = color;
    }
}

export class SpriteTexture extends AABBDrawableComponent {

    private _widthSegments: number = 1;
    private _heightSegments: number = 1;

    private _selectedWidthSegment: number = 0;
    private _selectedHeightSegment: number = 0;

    constructor(entity: Entity, texturePath: string, spriteWidthSegments: number, spriteHeightSegments: number) {
         super(entity, texturePath);
         this._widthSegments = spriteWidthSegments;
         this._heightSegments = spriteHeightSegments;
    }

    getType(): DrawingSystem.Types {
        return DrawingSystem.Types.SpriteTexture;
    }

    get widthSegments() {
        return this._widthSegments;
    }

    get heightSegments() {
        return this._heightSegments;
    }

    get selectedWidthSegment() {
        return this._selectedWidthSegment;
    }
    set selectedWidthSegment(newWidthSegment: number) {
        assert(newWidthSegment < this._widthSegments, "Selected segment exceeding defined limits.");
        this._selectedWidthSegment = newWidthSegment;
    }

    get selectedHeightSegment() {
        return this._selectedHeightSegment;
    }
    set selectedHeightSegment(newHeightSegment: number) {
        assert(newHeightSegment < this._heightSegments, "Selected segment exceeding defined limits.");
        this._selectedHeightSegment = newHeightSegment;
    }
}

export class DrawableAoERectangleClosed extends DrawingSystem.Component {
    
    width: number = 1;
    height: number = 1;
    opacity: number = 1;

    constructor(entity: Entity, width: number = 1, height: number = 1) {
        super(entity);
        this.width = width;
        this.height = height;
    }

    getType(): DrawingSystem.Types {
        return DrawingSystem.Types.AOE_RectangleClosed;
    }

    serialize(output: Record<string, any>): Record<string, any> {
        let result = super.serialize(output);

        result.uniformParameters.mat4['uObjectData.transform'] = this.transform.worldTransform;
        result.uniformParameters.float['uObjectData.width'] = this.width;
        result.uniformParameters.float['uObjectData.height'] = this.height;
        result.uniformParameters.float['uTimeData.globalTime'] = GlobalClock.clock.getCurrentFrameTimeMs()

        return result;
    }
}

