import { throws } from "assert";
import { vec2, vec3, vec4,  mat3, mat4 } from "gl-matrix";
import { ComponentBase } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { SystemBase } from "../Base/System"
import { Uuid } from "../Base/UuidGenerator"
import { Collisions } from "../Common/Math/Collisions";
import { vec3tovec2 } from "../Common/Math/gl-extensions";
import { Shapes } from "../Common/Math/Shapes"

export namespace TriggerCollisionSystem2D {

    export interface TriggerListener {
        onTriggered(triggededBy: Readonly<Component>): void
    }

    export enum Type {
        Circle,
        Rectangle,
        Cone
    };

    export abstract class Component extends ComponentBase {
        // Metadata
        static staticMetaName(): string { return 'TriggerCollisionSystem2D.Component' }

        private _transform: mat4 = mat4.create();
        
        public triggerListener: TriggerListener | undefined;

        get metaName(): Readonly<string> {
            return Component.staticMetaName();
        }

        get systemMetaName(): string {
            return System.staticMetaName();
        }

        abstract get type(): Readonly<Type>;

        set transform(newTransform: mat4) {
            this._transform = newTransform;
        }

        get transform() : mat4 {
            return this._transform;
        }

        get worldTransform() : mat4 {
            return mat4.mul(mat4.create(), this.ownerEntity.transform.worldTransform, this._transform);
        }
    }

    export class System extends SystemBase<Component> {
        // Metadata
        static staticMetaName(): string { return 'TriggerCollisionSystem2D.System' }

        // SystemBase implementation
        get metaName(): string {
            return System.staticMetaName();
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
                case Type.Circle:
                    return this.checkCircleCircleCollision(other as CircleTriggerComponent, circle);
                case Type.Rectangle:
                    return this.checkCircleRectangleCollision(circle, other as RectangleTriggerComponent);
                case Type.Cone:
                    throw new Error("Not implemented");
            }
        }

        // Same Shape
        private checkCircleCircleCollision(circleOne: Readonly<CircleTriggerComponent>, circleTwo: Readonly<CircleTriggerComponent>) : boolean {
            return Collisions.D2.CheckCircleCircle(circleOne.collider, circleTwo.collider);
        }

        private checkRectangleRectangleCollision(rectangleOne: Readonly<RectangleTriggerComponent>, rectangleTwo: Readonly<RectangleTriggerComponent>) : boolean {
            return Collisions.D2.CheckRectangleRectangle(rectangleOne.collider, rectangleTwo.collider);
        }

        // Shuffle shapes
        private checkCircleRectangleCollision(circle: Readonly<CircleTriggerComponent>, rectangle: Readonly<RectangleTriggerComponent>) : boolean {
            return Collisions.D2.CheckRectangleCircle(rectangle.collider, circle.collider);
        }

    };

    export class CircleTriggerComponent extends Component {
        private _collisionShape: Shapes.D2.Circle = new Shapes.D2.Circle();

        constructor(ownerEntity: Entity, radius: number) {
            super(ownerEntity);
            this._collisionShape.radius = radius;
        }

        get type(): Readonly<Type> {
            return Type.Circle;
        }

        get shape(): Shapes.D2.Circle {
            return this._collisionShape;
        }

        get collider(): Collisions.D2.CircleCollider {
            // TODO: catche collider descriptions within the component instead of recalculating on every check.
            const collider = new Collisions.D2.CircleCollider();

            const translation = vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, 0, 1), this.worldTransform);
            collider.position = vec2.fromValues(translation[0], translation[2]);
            collider.radius = this.shape.radius;

            return collider;
        }
    }

    export class RectangleTriggerComponent extends Component {
        private _collisionShape: Shapes.D2.Rectangle = new Shapes.D2.Rectangle();

        get type(): Readonly<Type> {
            return Type.Rectangle;
        }

        get shape(): Shapes.D2.Rectangle {
            return this._collisionShape;
        }

        get collider(): Collisions.D2.RectangleCollider {
            // TODO: catche collider descriptions within the component instead of recalculating on every check.
            const collider = new Collisions.D2.RectangleCollider();
            const translation = vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, 0, 1), this.worldTransform);
            collider.position = vec2.fromValues(translation[0], translation[2]);

            const widthExtensionVec = vec4.transformMat4(vec4.create(), vec4.fromValues(this.shape.width, 0, 0, 0), this.worldTransform);
            const heightExtensionVec = vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, this.shape.height, 0), this.worldTransform);

            collider.xExtension = vec2.fromValues(widthExtensionVec[0], widthExtensionVec[2]);
            collider.yExtension = vec2.fromValues(heightExtensionVec[0], heightExtensionVec[2]);

            return collider;
        }
    }
}