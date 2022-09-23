import { Entity } from "@core/Base/Entity";
import { TextureSquareDrawable } from "./TextureSquareDrawable";
import { vec2 } from "gl-matrix";

export class SpriteSquareDrawable extends TextureSquareDrawable {

    spriteSize: vec2 = [1, 1]
    private _selection: vec2 = [0, 0];

    constructor(owner: Entity, spritePath: string, spriteSize: vec2, size: number = 1) {
        super(owner, spritePath, size);
        this.spriteSize = spriteSize
    }

    serialize(output: Record<string, any>): Record<string, any> {
        let result = super.serialize(output);

        // Same as texture, just swap a few things.
        result.assetPaths.vertexShader = 'Common/Basic/Drawing/Sprite.vs.glsl';
        result.assetPaths.pixelShader = 'Common/Basic/Drawing/Sprite.fs.glsl';

        result.uniformParameters.ivec2['uObjectData.spriteSize'] = this.spriteSize;
        result.uniformParameters.ivec2['uObjectData.selection'] = this.selection;

        return result;
    }

    set selection(value: Readonly<vec2>) {
        this._selection = [value[0] % this.spriteSize[0], value[1] % this.spriteSize[1]];
    }

    get selection(): Readonly<vec2> {
        return this._selection;
    }
}