import { mat4, vec3 } from "gl-matrix";

export class Transform {

    private _position: vec3 = [0, 0, 0];
    private _rotation: vec3 = [0, 0, 0];
    private _scale: vec3 = [1, 1, 1];

    private _transform: mat4 = mat4.create();
    private _worldTransform: mat4 = mat4.create();

    set position(value: Readonly<vec3>) {
        this._position = vec3.clone(value);
    }

    set rotation(value: Readonly<vec3>) {
        this._rotation = vec3.clone(value);
    }

    set scale(value: Readonly<vec3>) {
        this._scale = vec3.clone(value);
    }

    get position() : vec3 {
        return this._position;
    }

    get rotation() : vec3 {
        return this._rotation;
    }

    get scale() : vec3 {
        return this._scale;
    }

    get transform() : Readonly<mat4> {
        
        return this._transform
    }

    get worldTransform(): Readonly<mat4> {
        return this._worldTransform;
    }
    
    updateTransform() : Readonly<mat4> {
        this._transform = mat4.create();
        mat4.scale(this._transform, this._transform, this._scale);
        mat4.rotateX(this._transform, this._transform, this._rotation[0]);
        mat4.rotateY(this._transform, this._transform, this._rotation[1]);
        mat4.rotateZ(this._transform, this._transform, this._rotation[2]);
        mat4.translate(this._transform, this._transform, this._position);

        return this._transform;
    }

    updateWorldTransform(parentWorldTransform: Readonly<mat4>) : Readonly<mat4> {
        this.updateTransform();
        
        mat4.mul(this._worldTransform, parentWorldTransform, this._transform);
        return this._worldTransform;
    }

};