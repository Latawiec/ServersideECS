import { mat4, vec3 } from "gl-matrix";


export interface Camera {
    get transform(): mat4;
    get viewTransform(): mat4;
};

export class RawCamera implements Camera {
    private _projection = mat4.create();
    private _viewTransform = mat4.create();

    constructor(viewTransform: mat4, projection: mat4) {
        // TOOD: I really need to resolve the naming of these holy shit.
        this._projection = projection;
        this._viewTransform = viewTransform;
    }

    get transform(): mat4 {
        return this._projection
    }

    get viewTransform(): mat4 {
        return this._viewTransform;    
    }
}

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
        // return mat4.ortho(
        //     projectionMatrix, 
        //     -10*this._aspect, 10*this._aspect,
        //     -10, 10, -20, 20
        // );
        return mat4.perspective(
            projectionMatrix,
            this._fovy,
            this._aspect,
            this._near,
            this._far 
        )
    }

    get viewTransform(): mat4 {
        const viewTransform  = mat4.create();
        mat4.lookAt(viewTransform, vec3.fromValues(0, 18, -7), vec3.fromValues(0, 0, 0,), vec3.fromValues(0, 1, 0));

        return viewTransform;
    }
}
