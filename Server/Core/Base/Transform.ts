import { mat4, vec3 } from "gl-matrix";

export class Transform {

    public static WORLD_UP = vec3.fromValues(0, 1, 0);

    private _transform: mat4 = mat4.create();
    private _worldTransform: mat4 = mat4.create();

    move(translation: Readonly<vec3>) : this {
        mat4.translate(this._transform, this._transform, translation);
        return this;
    }

    moveTo(position: Readonly<vec3>) : this {
        const translation = mat4.getTranslation(vec3.create(), this._transform);
        const diff = vec3.sub(vec3.create(), position, translation);
        this.move(diff);
        return this;
    }

    setTranslation(translatoin: Readonly<vec3>) : this {
        this._transform[12] = translatoin[0];
        this._transform[13] = translatoin[1];
        this._transform[14] = translatoin[2];
        return this;
    }

    rotate(axis: Readonly<vec3>, rad: number) : this {
        mat4.rotate(this._transform, this._transform, rad, axis);
        return this;
    }
    
    rotateTowards(target: Readonly<vec3>) : this {
        const translation = mat4.getTranslation(vec3.create(), this._transform);
        mat4.targetTo(this._transform, translation, target, Transform.WORLD_UP);
        return this;
    }

    scale(scale: Readonly<vec3>) : this {
        mat4.scale(this._transform, this._transform, scale);
        return this;
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