import { ComponentBase } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { SystemBase } from "../Base/System"
import { Uuid } from "../Base/UuidGenerator"
import { Collisions } from "../Common/Math/Collisions";
import { Shapes } from "../Common/Math/Shapes"

export namespace PhysicsCollisionSystem2D {

    export interface CollisionListener {
        onCollision(): void;
    }

    export enum Type {
        Point,
        Circle,
        Rectangle
    };

    export abstract class Component implements ComponentBase {
        // Metadata
        static staticMetaName(): string { return 'PhysicsCollisionSystem2D.Component' }

        private _ownerEntity: Entity;
        private _isActive: boolean = true;
        private _systemAsignedId: Uuid | undefined = undefined;
        private _isStatic: boolean = false;

        constructor(owner: Entity, isStatic = false) {
            this._ownerEntity = owner
            this._isStatic = isStatic
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

        abstract get type(): Readonly<Type>;

        set systemAsignedId(value: Uuid | undefined) {
            this._systemAsignedId = value;
        }
    }

    export class System extends SystemBase<Component> {
        // Metadata
        static staticMetaName(): string { return 'PhysicsCollisionSystem2D.System' }

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
            
        }
    };

    export class PointCollisionComponent extends Component {
        private _collisionShape: Shapes.D2.Point = new Shapes.D2.Point();

        get type(): Readonly<Type> {
            return Type.Point;
        }

        get shape(): Readonly<Shapes.D2.Point> {
            return this._collisionShape;
        }
    };

    export class CircleCollisionComponent extends Component {
        private _collisionShape: Shapes.D2.Circle = new Shapes.D2.Circle();

        get type(): Readonly<Type> {
            return Type.Circle;
        }

        get shape(): Readonly<Shapes.D2.Circle> {
            return this._collisionShape;
        }
    }

    export class RectangleCollisionComponent extends Component {
        private _collisionShape: Shapes.D2.Rectangle = new Shapes.D2.Rectangle();

        get type(): Readonly<Type> {
            return Type.Rectangle;
        }

        get shape(): Readonly<Shapes.D2.Rectangle> {
            return this._collisionShape;
        }
    }
}