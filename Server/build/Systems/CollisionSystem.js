"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const gl_matrix_1 = require("gl-matrix");
const System_1 = require("../Base/System");
function abs(vector) {
    return gl_matrix_1.vec3.fromValues(Math.abs(vector[0]), Math.abs(vector[1]), Math.abs(vector[2]));
}
function maxcomp(vector) {
    return Math.max(vector[0], vector[1], vector[2]);
}
class CollisionComponent {
    constructor(owner) {
        this._isActive = true;
        this._ownerEntity = owner;
    }
    get isActive() {
        return this._isActive;
    }
    get metaName() {
        return CollisionComponent._componentId;
    }
    get ownerEntity() {
        throw new Error("Method not implemented.");
    }
    get systemAsignedId() {
        throw new Error("Method not implemented.");
    }
    set systemAsignedId(value) {
        throw new Error("Method not implemented.");
    }
}
_a = CollisionComponent;
CollisionComponent._componentId = _a.name;
class BoxCollisionComponent extends CollisionComponent {
    constructor() {
        super(...arguments);
        this._extents = [1.0, 1.0, 1.0];
        this._position = [0.0, 0.0, 0.0];
    }
    distance(point) {
        let diff;
        gl_matrix_1.vec3.subtract(diff, abs(point), this._extents);
        // this is [0, +inf] ranged
        let outsideDist = gl_matrix_1.vec3.length(gl_matrix_1.vec3.max(gl_matrix_1.vec3.create(), diff, [0, 0, 0]));
        // this is [-inf, 0] ranged
        let insideDist = Math.min(maxcomp(diff), 0);
        return outsideDist + insideDist;
    }
    get position() {
        return this._position;
    }
    get extents() {
        return this._extents;
    }
}
class SphereCollisionComponent extends CollisionComponent {
    constructor() {
        super(...arguments);
        this._radius = 1.0;
        this._position = [0.0, 0.0, 0.0];
    }
    distance(point) {
        return gl_matrix_1.vec3.length(point) - this._radius;
    }
    get position() {
        return this._position;
    }
    get radius() {
        return this._radius;
    }
}
class CollisionSystem extends System_1.System {
    registerComponent(component) {
        this._registerComponent(component);
        return component;
    }
    unregisterComponent(component) {
        this._unregisterComponent(component);
        return component;
    }
    static testSphereBox(sphere, box) {
        return false;
    }
    static testSphereSphere(sphereOne, sphereTwo) {
        var distance = sphereOne.distance(sphereTwo.position) - sphereTwo.radius;
        return distance > 0;
    }
    static testBoxBox(boxOne, boxTwo) {
        // For boxes we can simply find each corner point of boxTwo, and just distance them to the boxOne. Simple no?
        // I can pick just two closest points to other's center for distance to box test.
        return false;
    }
}
