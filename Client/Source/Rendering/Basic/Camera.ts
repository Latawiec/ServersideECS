import { mat4 } from "gl-matrix";


export interface Camera {
    get transform(): mat4;
};

export class PerspectiveCamera implements Camera {
    private _fovy: number;
    private _aspect: number;
    private _near: number;
    private _far: number;

    constructor(fovy: number, aspect: number, near: number, far: number) {
        this._fovy = fovy;
        this._aspect = aspect;
        this._near = near;
        this._far = far;
    }

    get transform(): mat4 {
        const projectionMatrix = mat4.create();
        mat4.identity(projectionMatrix);
        return mat4.perspective(
            projectionMatrix,
            this._fovy,
            this._aspect,
            this._near,
            this._far 
        )
    }
}
