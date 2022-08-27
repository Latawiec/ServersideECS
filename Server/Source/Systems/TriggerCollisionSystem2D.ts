import { throws } from "assert";
import { ComponentBase } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { SystemBase } from "../Base/System"
import { Uuid } from "../Base/UuidGenerator"
import { Collisions } from "../Common/Math/Collisions";
import { Shapes } from "../Common/Math/Shapes"

export namespace TriggerCollisionSystem2D {

    export interface TriggerListener {
        onTriggered(triggededBy: Readonly<Component>): void
    }

    export enum Type {
        Point,
        Circle,
        Rectangle,
        Cone
    };

    export abstract class Component implements ComponentBase {
        // Metadata
        static staticMetaName(): string { return 'TriggerCollisionSystem2D.Component' }

        private _ownerEntity: Entity;
        private _isActive: boolean = true;
        private _systemAsignedId: Uuid | undefined = undefined;
        
        public triggerListener: TriggerListener | undefined;

        constructor(owner: Entity) {
            this._ownerEntity = owner
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
        static staticMetaName(): string { return 'TriggerCollisionSystem2D.System' }

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
            // Just do O(n^2) for now. I wanna see if it works.
            for (const componentOne of this._getComponentsMap()) {
                const triggerOne = componentOne[1];
                if (!triggerOne.isActive) {
                    continue;
                }

                for (const componentTwo of this._getComponentsMap()) {
                    const triggerTwo = componentTwo[1];
                    if (!triggerTwo.isActive || triggerOne == triggerTwo) {
                        continue;
                    }

                    if (this.checkCollision(triggerOne, triggerTwo)) {
                        triggerOne.triggerListener?.onTriggered(triggerTwo);
                    }
                }
            }
        }

        private checkCollision(lhs: Readonly<Component>, rhs: Readonly<Component>) : boolean {
            switch (lhs.type) {
                case Type.Point:
                    return this.checkPointCollision(lhs as PointTriggerComponent, rhs);
                case Type.Circle:
                    return this.checkCircleCollision(lhs as CircleTriggerComponent, rhs);
                case Type.Rectangle:
                    return this.checkRectangleCollision(lhs as RectangleTriggerComponent, rhs);
                case Type.Cone:
                    throw new Error("Not implemented");
            }
        }

        private checkRectangleCollision(rectangle: Readonly<RectangleTriggerComponent>, other: Readonly<Component>) : boolean {
            switch (other.type) {
                case Type.Point:
                    return this.checkPointRectangleCollision(other as PointTriggerComponent, rectangle);
                case Type.Circle:
                    return this.checkCircleRectangleCollision(other as CircleTriggerComponent, rectangle);
                case Type.Rectangle:
                    return this.checkRectangleRectangleCollision(other as RectangleTriggerComponent, rectangle);
                case Type.Cone:
                    throw new Error("Not implemented");
            }
        }

        private checkCircleCollision(circle: Readonly<CircleTriggerComponent>, other: Readonly<Component>) : boolean {
            switch (other.type) {
                case Type.Point:
                    return this.checkPointCircleCollision(other as PointTriggerComponent, circle);
                case Type.Circle:
                    return this.checkCircleCircleCollision(other as CircleTriggerComponent, circle);
                case Type.Rectangle:
                    return this.checkCircleRectangleCollision(circle, other as RectangleTriggerComponent);
                case Type.Cone:
                    throw new Error("Not implemented");
            }
        }

        private checkPointCollision(point: Readonly<PointTriggerComponent>, other: Readonly<Component>) : boolean {
            switch (other.type) {
                case Type.Point:
                    return this.checkPointPointCollision(other as PointTriggerComponent, point);
                case Type.Circle:
                    return this.checkPointCircleCollision(point, other as CircleTriggerComponent);
                case Type.Rectangle:
                    return this.checkPointRectangleCollision(point, other as RectangleTriggerComponent);
                case Type.Cone:
                    throw new Error("Not implemented");
            }
        }

        // Same Shape
        private checkPointPointCollision(pointOne: Readonly<PointTriggerComponent>, pointTwo: Readonly<PointTriggerComponent>) : boolean {
            return false;
        }

        private checkCircleCircleCollision(circleOne: Readonly<CircleTriggerComponent>, circleTwo: Readonly<CircleTriggerComponent>) : boolean {
            return Collisions.D2.CheckCircleCircle(circleOne.worldTransformedShape, circleTwo.worldTransformedShape);
        }

        private checkRectangleRectangleCollision(rectangleOne: Readonly<RectangleTriggerComponent>, rectangleTwo: Readonly<RectangleTriggerComponent>) : boolean {
            return Collisions.D2.CheckRectangleRectangle(rectangleOne.worldTransformedShape, rectangleTwo.worldTransformedShape);
        }

        // Shuffle shapes
        private checkPointRectangleCollision(point: Readonly<PointTriggerComponent>, rectangle: Readonly<RectangleTriggerComponent>) : boolean {
            return Collisions.D2.CheckRectanglePoint(rectangle.worldTransformedShape, point.worldTransformedShape)
        }

        private checkPointCircleCollision(point: Readonly<PointTriggerComponent>, circle: Readonly<CircleTriggerComponent>) : boolean {
            return Collisions.D2.CheckCirclePoint(circle.worldTransformedShape, point.worldTransformedShape);
        }

        private checkCircleRectangleCollision(circle: Readonly<CircleTriggerComponent>, rectangle: Readonly<RectangleTriggerComponent>) : boolean {
            return Collisions.D2.CheckRectangleCircle(rectangle.worldTransformedShape, circle.worldTransformedShape);
        }

    };

    export class PointTriggerComponent extends Component {
        private _collisionShape: Shapes.D2.Point = new Shapes.D2.Point();

        get type(): Readonly<Type> {
            return Type.Point;
        }

        get shape(): Readonly<Shapes.D2.Point> {
            return this._collisionShape;
        }

        get worldTransformedShape(): Readonly<Shapes.D2.Point> {
            return this._collisionShape.transformMat4(this.ownerEntity.getTransform().worldTransform);
        }
    };

    export class CircleTriggerComponent extends Component {
        private _collisionShape: Shapes.D2.Circle = new Shapes.D2.Circle();

        get type(): Readonly<Type> {
            return Type.Circle;
        }

        get shape(): Shapes.D2.Circle {
            return this._collisionShape;
        }

        get worldTransformedShape(): Readonly<Shapes.D2.Circle> {
            return this._collisionShape.transformMat4(this.ownerEntity.getTransform().worldTransform);
        }
    }

    export class RectangleTriggerComponent extends Component {
        private _collisionShape: Shapes.D2.Rectangle = new Shapes.D2.Rectangle();

        get type(): Readonly<Type> {
            return Type.Rectangle;
        }

        get shape(): Readonly<Shapes.D2.Rectangle> {
            return this._collisionShape;
        }

        get worldTransformedShape(): Readonly<Shapes.D2.Rectangle> {
            return this._collisionShape.transformMat4(this.ownerEntity.getTransform().worldTransform);
        }
    }
}