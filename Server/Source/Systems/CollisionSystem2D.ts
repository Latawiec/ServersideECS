import {mat4, vec3} from "gl-matrix"
import { ComponentBase } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { SystemBase } from "../Base/System"
import { Uuid } from "../Base/UuidGenerator"
import { Shapes } from "../Common/Math/Shapes"


export namespace CollisionSystem2D {

    export interface CollisionListener {
        onCollision(): void;
    }

    export enum Type {
        Rectangle,
        Circle,
        Cone
    };

    export abstract class Component implements ComponentBase {
        // Metadata
        static staticMetaName(): string { return 'CollisionSystem2D.Component' }

        private _ownerEntity: Entity;
        private _isActive: boolean = true;
        private _systemAsignedId: Uuid | undefined = undefined;
        private _isDynamic = false;
        private _isPhysical = false;
        private _isNegativeShape = false;
        
        constructor(owner: Entity, _isPhysical: boolean = false, _isNegativeShape: boolean = false) {
            this._ownerEntity = owner
            this._isPhysical = _isPhysical
            this._isNegativeShape = _isNegativeShape
        }
    
        get isPhysical(): Readonly<boolean> { 
            return this._isPhysical;
        }

        get isDynamic(): Readonly<boolean> {
            return this._isDynamic;
        }

        get isActive(): Readonly<boolean> {
            return this._isActive
        }

        get metaName(): Readonly<string> {
            return Component.staticMetaName();
        }

        get systemMetaName(): string {
            return System.staticMetaName();
        }

        get ownerEntity(): Entity {
            return this._ownerEntity;
        }

        get systemAsignedId(): Uuid | undefined {
            return this._systemAsignedId;
        }

        abstract get type(): Type;

        set systemAsignedId(value: Uuid | undefined) {
            this._systemAsignedId = value;
        }

    }

    export class System extends SystemBase<Component> {
        // Metadata
        static staticMetaName(): string { return 'CollisionSystem2D.System' }

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

        updatePhysicalCollisions() {
            // n^2 for now. I just wanna see if it works right.
            for(const componentCollider of this._getComponentsMap()) {
                const collider = componentCollider[1];
                if (!collider.isPhysical) {
                    continue
                }

                for (const testComponentcollider of this._getComponentsMap()) {
                    const testedCollider = testComponentcollider[1];
                    if (!testedCollider.isPhysical) {
                        continue
                    }   

                    
                }
            }
        }
    }

    export class RectangleCollisionComponent extends CollisionSystem2D.Component {
        private _collisionShape: Shapes.D2.Rectangle = new Shapes.D2.Rectangle();

        get type(): Type {
            return CollisionSystem2D.Type.Rectangle
        }
    }

    export class CircleCollisionComponent extends CollisionSystem2D.Component {
        private _collisionShape: Shapes.D2.Circle = new Shapes.D2.Circle();

        get type(): Type {
            return CollisionSystem2D.Type.Circle;
        }
    }

} // namespace CollisionSystem2D
