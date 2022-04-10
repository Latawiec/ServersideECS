import {vec3} from "gl-matrix"
import { Component } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { System } from "../Base/System"

function abs(vector: Readonly<vec3>): vec3 {
    return vec3.fromValues(
        Math.abs(vector[0]),
        Math.abs(vector[1]),
        Math.abs(vector[2])
    );
}

function maxcomp(vector: Readonly<vec3>): number {
    return Math.max(vector[0], vector[1], vector[2]);
}

interface CollisionListener {
    onCollision(): void;
}


class CollisionComponent implements Component {
    private _ownerEntity: Entity;
    private _isActive: boolean = true;
    private static _componentId: string = this.name;
    
    constructor(owner: Entity) {
        this._ownerEntity = owner
    }

    get isActive(): Readonly<boolean> {
        return this._isActive
    }
    get metaName(): Readonly<string> {
        return CollisionComponent._componentId;
    }
    get ownerEntity(): Entity {
        throw new Error("Method not implemented.");
    }
    get systemAsignedId(): number {
        throw new Error("Method not implemented.");
    }
    set systemAsignedId(value: number) {
        throw new Error("Method not implemented.");
    }
}

class BoxCollisionComponent extends CollisionComponent {
    private _extents: vec3 = [1.0, 1.0, 1.0]
    private _position: vec3 = [0.0, 0.0, 0.0];

    distance(point: Readonly<vec3>): number {
        let diff!: vec3;
        vec3.subtract(diff, abs(point), this._extents);

        // this is [0, +inf] ranged
        let outsideDist: number = vec3.length(vec3.max(vec3.create(), diff, [0, 0, 0]));
        // this is [-inf, 0] ranged
        let insideDist: number = Math.min(maxcomp(diff), 0);

        return outsideDist + insideDist;
    }

    get position(): Readonly<vec3> {
        return this._position
    }

    get extents(): Readonly<vec3> {
        return this._extents;
    }
}

class SphereCollisionComponent extends CollisionComponent {
    private _radius: number = 1.0;
    private _position: vec3 = [0.0, 0.0, 0.0];

    distance(point: Readonly<vec3>): number {
        return vec3.length(point) - this._radius;
    }

    get position(): Readonly<vec3> {
        return this._position
    }

    get radius(): Readonly<number> {
        return this._radius
    }
}

class CollisionSystem extends System<CollisionComponent> {

    registerComponent(component: CollisionComponent): CollisionComponent {
        this._registerComponent(component);
        return component;
    }
    unregisterComponent(component: CollisionComponent): CollisionComponent {
        this._unregisterComponent(component);
        return component;
    }

    static testSphereBox(sphere: Readonly<SphereCollisionComponent>, box: Readonly<BoxCollisionComponent>): boolean {

        return false
    }

    static testSphereSphere(sphereOne: Readonly<SphereCollisionComponent>, sphereTwo: Readonly<SphereCollisionComponent>): boolean {
        var distance = sphereOne.distance(sphereTwo.position) - sphereTwo.radius;
        return distance > 0;
    }

    static testBoxBox(boxOne: Readonly<BoxCollisionComponent>, boxTwo: Readonly<BoxCollisionComponent>): boolean {
        // For boxes we can simply find each corner point of boxTwo, and just distance them to the boxOne. Simple no?
        // I can pick just two closest points to other's center for distance to box test.

        return false
    }
}