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
                    if (!triggerTwo.isActive || componentOne == componentTwo) {
                        continue;
                    }

                    if (this.checkCollision(triggerOne, triggerTwo)) {
                        triggerOne.triggerListener?.onTriggered(triggerTwo);
                    }
                }
            }
        }

        private checkCollision(lhs: Readonly<Component>, rhs: Readonly<Component>) : boolean {
            

            
        }

        private checkRectangleCollision(rectangle: Readonly<RectangleTriggerComponent>, other: Readonly<Component>) : boolean {

        }

        private checkCircleCollision(circle: Readonly<CircleTriggerComponent>, other: Readonly<Component>) : boolean {

        }

        private checkPointCollision(point: Readonly<PointTriggerComponent>, other: Readonly<Component>) : boolean {

        }

        // Same Shape
        private checkPointPointCollision(pointOne: Readonly<PointTriggerComponent>, pointTwo: Readonly<PointTriggerComponent>) : boolean {
            return false;
        }

        private checkCircleCircleCollision(circleOne: Readonly<CircleTriggerComponent>, circleTwo: Readonly<CircleTriggerComponent>) : boolean {
            return Collisions.D2.CheckCircleCircle(circleOne.shape, circleTwo.shape);
        }

        private checkRectangleRectangleCollision(rectangleOne: Readonly<RectangleTriggerComponent>, rectangleTwo: Readonly<RectangleTriggerComponent>) : boolean {
            
        }

        // Shuffle shapes
        private checkPointRectangleCollision(point: Readonly<PointTriggerComponent>, rectangle: Readonly<RectangleTriggerComponent>) : boolean {
            
        }

        private checkPointCircleCollision(point: Readonly<PointTriggerComponent>, circle: Readonly<CircleTriggerComponent>) : boolean {

        }

        private checkCircleRectangleCollision(circle: Readonly<CircleTriggerComponent>, rectangle: Readonly<RectangleTriggerComponent>) : boolean {

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
    };

    export class CircleTriggerComponent extends Component {
        private _collisionShape: Shapes.D2.Circle = new Shapes.D2.Circle();

        get type(): Readonly<Type> {
            return Type.Circle;
        }

        get shape(): Readonly<Shapes.D2.Circle> {
            return this._collisionShape;
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
    }
}