import { mat4, vec3 } from "gl-matrix";

export class Transform {

    public static WORLD_UP = vec3.fromValues(0, 1, 0);

    private _transform: mat4 = mat4.create();
    private _worldTransform: mat4 = mat4.create();

    move(translation: Readonly<vec3>) {
        mat4.translate(this._transform, this._transform, translation);
    }

    moveTo(position: Readonly<vec3>) {
        const translation = mat4.getTranslation(vec3.create(), this._transform);
        const diff = vec3.sub(vec3.create(), position, translation);
        this.move(diff);
    }

    rotate(axis: Readonly<vec3>, rad: number) {
        mat4.rotate(this._transform, this._transform, rad, axis);
    }
    
    rotateTowards(target: Readonly<vec3>) {
        const translation = mat4.getTranslation(vec3.create(), this._transform);
        mat4.targetTo(this._transform, translation, target, Transform.WORLD_UP);
    }

    scale(scale: Readonly<vec3>) {
        mat4.scale(this._transform, this._transform, scale);
    }

    get transform() : Readonly<mat4> {
        
        return this._transform
    }

    get worldTransform(): Readonly<mat4> {
        return this._worldTransform;
    }

    updateWorldTransform(parentWorldTransform: Readonly<mat4>) : Readonly<mat4> {   
        mat4.mul(this._worldTransform, parentWorldTransform, this._transform);
        return this._worldTransform;
    }

};