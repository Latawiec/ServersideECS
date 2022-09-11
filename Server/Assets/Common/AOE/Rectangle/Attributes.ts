import { mat4, vec3, vec4 } from "gl-matrix"

export namespace Assets.Common.AOE.Circle {

export class UniformAttributes {
    uProjectionMatrix: mat4 = mat4.create();
    uModelViewMatrix: mat4 = mat4.create();
    uColor: vec4 = vec4.create();
    uTime: number = 0.0;
}

}
