import { mat4 } from "gl-matrix";
;
export class PerspectiveCamera {
    constructor(fovy, aspect, near, far) {
        this._fovy = fovy;
        this._aspect = aspect;
        this._near = near;
        this._far = far;
    }
    get transform() {
        const projectionMatrix = mat4.create();
        mat4.identity(projectionMatrix);
        return mat4.perspective(projectionMatrix, this._fovy, this._aspect, this._near, this._far);
    }
}
