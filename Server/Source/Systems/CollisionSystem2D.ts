import {mat4, vec3} from "gl-matrix"
import { ComponentBase } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { SystemBase } from "../Base/System"
import { Uuid } from "../Base/UuidGenerator"
import { Collisions } from "../Common/Math/Collisions";
import { Shapes } from "../Common/Math/Shapes"


export namespace CollisionSystem2D {

    export interface CollisionListener {
        onCollision(): void;
    }

    export enum Type {
        Point,
        Circle,
        Rectangle,
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
            if (component.isPhysical) {
                this._physicalColliders.push(component);
            }
            return component;
        }
        unregisterComponent(component: Component): Component {
            this._unregisterComponent(component);
            if (component.isPhysical) {
                const index = this._physicalColliders.indexOf(component, 0);
                if (index != undefined) {
                    this._physicalColliders.splice(index, 1);
                }
            }
            return component;
        }


        // Let it be here for now. I should move it somewhere else tho.
        updatePhysicalCollisions() {
            // n^2 for now. I just wanna see if it works right.
            for(const componentCollider of this._getComponentsMap()) {
                const collider = componentCollider[1];
                if (!collider.isPhysical) {
                    continue
                }
                
                const colliderType = collider.type;

                for (const testComponentcollider of this._getComponentsMap()) {
                    const testedCollider = testComponentcollider[1];
                    if (!testedCollider.isPhysical) {
                        continue
                    }   

                    const testedType = testedCollider.type;
                    
                    if (colliderType == CollisionSystem2D.Type.Rectangle && testedType == CollisionSystem2D.Type.Rectangle) {
                        const rectOne = collider as CollisionSystem2D.RectangleCollisionComponent;
                        const rectTwo = testedCollider as CollisionSystem2D.RectangleCollisionComponent;

                        if (Collisions.D2.CheckRectangleRectangle(rectOne.shape, rectTwo.shape) || Collisions.D2.CheckRectangleRectangle(rectTwo.shape, rectOne.shape)) {

                        }
                    }
                    
                    if (colliderType == CollisionSystem2D.Type.Rectangle && testedType == CollisionSystem2D.Type.Circle) {
                        const rect = collider as CollisionSystem2D.RectangleCollisionComponent;
                        const circle = testedCollider as CollisionSystem2D.CircleCollisionComponent;

                    }

                    if (colliderType == CollisionSystem2D.Type.Circle && testedType == CollisionSystem2D.Type.Rectangle) {
                        const circle = collider as CollisionSystem2D.RectangleCollisionComponent;
                        const rect = testedCollider as CollisionSystem2D.CircleCollisionComponent;
                    }

                    if (colliderType == CollisionSystem2D.Type.Circle && testedType == CollisionSystem2D.Type.Circle) {
                        const circleOne = collider as CollisionSystem2D.CircleCollisionComponent;
                        const circleTwo = testedCollider as CollisionSystem2D.CircleCollisionComponent;
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

        get shape() : Readonly<Shapes.D2.Rectangle> {
            return this._collisionShape;
        }
    }

    export class CircleCollisionComponent extends CollisionSystem2D.Component {
        private _collisionShape: Shapes.D2.Circle = new Shapes.D2.Circle();

        get type(): Type {
            return CollisionSystem2D.Type.Circle;
        }

        get shape() : Readonly<Shapes.D2.Circle> {
            return this._collisionShape;
        }
    }

    export class PointCollisionComponent extends CollisionSystem2D.Component {
        private _collisionShape: Shapes.D2.Point = new Shapes.D2.Point();

        get type(): Type {

        }
    }

} // namespace CollisionSystem2D
