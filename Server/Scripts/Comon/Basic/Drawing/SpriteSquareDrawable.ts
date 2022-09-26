import { Entity } from "@core/Base/Entity";
import { DrawingSystem } from "@core/Systems/DrawingSystem";
import { vec2 } from "gl-matrix";
import { Serialization } from "@core/Serialization/WorldSnapshot";

export class SpriteSquareDrawable extends DrawingSystem.Component {

    size: number = 1;
    texturePath: string;
    opacity: number = 1;
    spriteSize: vec2 = [1, 1]
    private _selection: vec2 = [0, 0];

    constructor(owner: Entity, spritePath: string, spriteSize: vec2, size: number = 1) {
        super(owner);
        this.texturePath = spritePath;
        this.spriteSize = spriteSize;
    }

    takeSnapshot(): Serialization.Drawable.Snapshot {
        const result = super.takeSnapshot();

        result.assets.vertexShader = 'Common/Basic/Drawing/Sprite.vs.glsl';
        result.assets.pixelShader = 'Common/Basic/Drawing/Sprite.fs.glsl';
        result.assets.mesh = 'Common/Meshes/squareCentered.json';
        result.assets.textures[0] = this.texturePath;

        result.vertexAttributes.vertices = 'aVertexPosition';
        result.vertexAttributes.uv = 'aUvCoord';

        result.uniformParameters.mat4['uObjectData.transform'] = Array.from(this.transform.worldTransform);
        result.uniformParameters.float['uObjectData.size'] = this.size;
        result.uniformParameters.float['uObjectData.opacity'] = this.opacity;
        result.uniformParameters.int['uObjectData.texSampler'] = 0;
        result.uniformParameters.ivec2['uObjectData.spriteSize'] = Array.from(this.spriteSize);
        result.uniformParameters.ivec2['uObjectData.selection'] = Array.from((this.selection));

        return result;
    }

    set selection(value: Readonly<vec2>) {
        this._selection = [value[0] % this.spriteSize[0], value[1] % this.spriteSize[1]];
    }

    get selection(): Readonly<vec2> {
        return this._selection;
    }
}