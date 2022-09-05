import { ComponentBase } from "../Base/Component"
import { vec2, vec3, vec4,  mat3, mat4 } from "gl-matrix";
import { Entity } from "../Base/Entity";
import { SystemBase } from "../Base/System"
import { Uuid } from "../Base/UuidGenerator"
import { Collisions } from "../Common/Math/Collisions";
import { Shapes } from "../Common/Math/Shapes"
import { throws } from "assert";
import { vec2decomposed, vec3tovec2, vec4tovec3 } from "../Common/Math/gl-extensions";

export namespace BlockingCollisionSystem2D {

    export interface CollisionListener {
        onCollision(): void;
    }

    export enum Type {
        Circle,
        Plane
    };

    export abstract class Component implements ComponentBase {
        // Metadata
        static staticMetaName(): string { return 'BlockingCollisionSystem2D.Component' }

        private _ownerEntity: Entity;
        private _isActive: boolean = true;
        private _systemAsignedId: Uuid | undefined = undefined;
        private _isBlocking: boolean = false;
        private _transform: mat4 = mat4.create();

        constructor(owner: Entity, isStatic = false) {
            this._ownerEntity = owner
            this._isBlocking = isStatic
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

        set transform(newTransform: mat4) {
            this._transform = newTransform;
        }

        get transform() : mat4 {
            return this._transform;
        }

        get worldTransform() : mat4 {
            return mat4.mul(mat4.create(), this.ownerEntity.getTransform().worldTransform, this._transform);
        }

        get isBlocking() : Readonly<boolean> {
            return this._isBlocking;
        }
    }

    export class System extends SystemBase<Component> {
        // Metadata
        static staticMetaName(): string { return 'BlockingCollisionSystem2D.System' }

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

                if (triggerOne.isBlocking) {
                    // We assume blocking colliders are static. Hence we'll not be updating their positions (they can't move).
                    continue;
                }

                var collisionSolution = vec2.create();
                for (const componentTwo of this._getComponentsMap()) {
                    const triggerTwo = componentTwo[1];
                    if (!triggerTwo.isActive || triggerOne == triggerTwo) {
                        continue;
                    }

                    if (!triggerTwo.isBlocking) {
                        // The collider we're checking collision with has to be blocking.
                        // No support for two dynamic objects collisions for now.
                        continue;
                    }

                    const collision = this.checkCollision(triggerOne, triggerTwo);
                    if (collision.length < 0) {
                        vec2.add(collisionSolution, collisionSolution, collision.vec2);
                    }
                }

                // TODO: I shouldn't update positions here, because state changes between iterations... 
                // But for now its all good I guess.
                const solutionAsVec4 = vec4.fromValues(collisionSolution[0], 0, collisionSolution[1], 0);
                const solutionInEntitySpace = vec4tovec3(vec4.transformMat4(vec4.create(), solutionAsVec4, mat4.invert(mat4.create(), triggerOne.ownerEntity.getTransform().worldTransform)));
                 vec3.add(
                    triggerOne.ownerEntity.getTransform().position,
                    triggerOne.ownerEntity.getTransform().position, 
                    solutionInEntitySpace
                );
            }
        }

        private checkCollision(from: Readonly<Component>, to: Readonly<Component>) : vec2decomposed {
            switch (from.type) {
                case Type.Circle:
                    return this.checkCircleCollision(from as Readonly<CircleCollisionComponent>, to);
                case Type.Plane:
                    return this.checkPlaneCollision(from as Readonly<PlaneCollisionComponent>, to);
            }
        }

        private checkCircleCollision(fromCircle: Readonly<CircleCollisionComponent>, to: Readonly<Component>) : vec2decomposed {
            switch (to.type) {
                case Type.Circle:
                    return this.measureCircleCircleCollision(fromCircle, to as Readonly<CircleCollisionComponent>);
                case Type.Plane:
                    return this.measureCirclePlaneCollision(fromCircle, (to as Readonly<PlaneCollisionComponent>));
            }
        }

        private checkPlaneCollision(from: Readonly<PlaneCollisionComponent>, to: Readonly<Component>) : vec2decomposed {
            switch (to.type) {
                case Type.Circle:
                    return Collisions.D2.PlaneCircleDistance(from.collider, (to as Readonly<CircleCollisionComponent>).collider);
                case Type.Plane:
                    // I don't know how to handle this. The only case where the distance matters is when planes are parallel.
                    // Ignore for now.
                    throw new Error("Not implemented");
            }
        }

        // Same shape
        private measureCircleCircleCollision(fromCircle: Readonly<CircleCollisionComponent>, toCircle: Readonly<CircleCollisionComponent>) : vec2decomposed {
            return Collisions.D2.CircleCircleDistance(fromCircle.collider, toCircle.collider);
        }

        // Shuffle shapes
        private measureCirclePlaneCollision(fromCircle: Readonly<CircleCollisionComponent>, toPlane: Readonly<PlaneCollisionComponent>) : vec2decomposed {
            return Collisions.D2.CirclePlaneDistance(fromCircle.collider, toPlane.collider);
        }

        private measurePlaneCircleCollision(fromPlane: Readonly<PlaneCollisionComponent>, toCircle: Readonly<CircleCollisionComponent>) : vec2decomposed {
            return Collisions.D2.PlaneCircleDistance(fromPlane.collider, toCircle.collider);
        }
    };

    export class CircleCollisionComponent extends Component {
        private _collisionShape: Shapes.D2.Circle = new Shapes.D2.Circle();

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

    export class PlaneCollisionComponent extends Component {
        private _collisionShape: Shapes.D2.Plane = new Shapes.D2.Plane();

        get type(): Readonly<Type> {
            return Type.Plane;
        }

        get shape(): Shapes.D2.Plane {
            return this._collisionShape;
        }

        get collider(): Collisions.D2.PlaneCollider {
            // TODO: catche collider descriptions within the component instead of recalculating on every check.
            const collider = new Collisions.D2.PlaneCollider();
            const transform = this.worldTransform;
            const inverseTransform = mat4.invert(mat4.create(), transform);
            const inverseTransposedTransform = mat4.transpose(mat4.create(), inverseTransform);

            const transformedPlane = vec4.fromValues(this._collisionShape.normal[0], 0, this._collisionShape.normal[1], this._collisionShape.distance);
            vec4.transformMat4(transformedPlane, transformedPlane, inverseTransposedTransform);

            collider.normal = vec2.fromValues(transformedPlane[0], transformedPlane[2]);
            collider.distance = transformedPlane[3];

            return collider;
        }
    }
}