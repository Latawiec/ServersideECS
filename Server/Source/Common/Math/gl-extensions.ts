import { ReadonlyVec3, ReadonlyVec2, vec2, vec3, vec4, mat4 } from "gl-matrix"

export class vec3decomposed {

    constructor(vector: Readonly<vec3>) {
        this.unitVector = vec3.normalize(vec3.create(), vector);
        this.length = vec3.length(vector);
    }

    unitVector: Readonly<vec3> = [0, 0, 0];
    length: Readonly<number>   = 0;
};

export class vec2decomposed {
    constructor(vector: Readonly<vec2>) {
        this.unitVector = vec2.normalize(vec2.create(), vector);
        this.length = vec2.length(vector);
    }

    unitVector: Readonly<vec2> = [0,0];
    length: Readonly<number> = 0;
}

export function vec3abs(out: vec3, a: ReadonlyVec3): vec3 {
    out = vec3.fromValues(Math.abs(a[0]), Math.abs(a[1]),  Math.abs(a[2]));
    return out;
}

export function vec2abs(out: vec2, a: ReadonlyVec2): vec2 {
    out = vec2.fromValues(Math.abs(a[0]), Math.abs(a[1]));
    return out;
}

export function vec3tovec4(inVec: Readonly<vec3>, isTransformable = true): vec4 {
    return vec4.fromValues(inVec[0], inVec[1], inVec[2], isTransformable ? 1 : 0);
}

export function vec4tovec3(inVec: Readonly<vec4>): vec3 {
    return vec3.fromValues(inVec[0], inVec[1], inVec[2]);
}

export function reflectVec3(vector: Readonly<vec3>, axis: Readonly<vec3>) : vec3 {
    const axisNorm = vec3.normalize(vec3.create(), axis);
    const projLength = vec3.dot(vector, axisNorm);
    const projection = vec3.scale(vec3.create(), axisNorm, projLength);

    const rejection = vec3.sub(vec3.create(), vector, projection);

    return vec3.subtract(vec3.create(), projection, rejection);
}

export function reflectVec2(vector: Readonly<vec2>, axis: Readonly<vec2>) : vec2 {
    const axisNorm = vec2.normalize(vec2.create(), axis);
    const projLength = vec2.dot(vector, axisNorm);
    const projection = vec2.scale(vec2.create(), axisNorm, projLength);

    const rejection = vec2.sub(vec2.create(), vector, projection);

    return vec2.subtract(vec2.create(), projection, rejection);
}

export function vec3clampNegative(out: vec3, a: ReadonlyVec3): vec3 {
    var result = vec3.create();
    result[0] = Math.max(a[0], 0);
    result[1] = Math.max(a[1], 0);
    result[2] = Math.max(a[2], 0);
    return result;
}

export function vec2clampNegative(out: vec2, a: ReadonlyVec2): vec2 {
    var result = vec2.create();
    result[0] = Math.max(a[0], 0);
    result[1] = Math.max(a[1], 0);
    return result;
}

export function vec3maxcomp(a: Readonly<vec3>): number {
    return Math.max(a[0], a[1], a[2]);
}

export function vec3mincomp(a: Readonly<vec3>): number {
    return Math.min(a[0], a[1], a[2]);
}

export function vec2maxcomp(a: Readonly<vec2>): number {
    return Math.max(a[0], a[1]);
}

export function vec2mincomp(a: Readonly<vec2>): number {
    return Math.min(a[0], a[1]);
}