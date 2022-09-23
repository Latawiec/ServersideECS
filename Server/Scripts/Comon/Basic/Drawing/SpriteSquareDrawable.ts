import { Entity } from "@core/Base/Entity";
import { DrawingSystem } from "@core/Systems/DrawingSystem";
import { vec2 } from "gl-matrix";

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

    serialize(): Record<string, any> {
        let result = super.serialize();

        result.assetPaths = {
            vertexShader: 'Common/Basic/Drawing/Sprite.vs.glsl',
            pixelShader: 'Common/Basic/Drawing/Sprite.fs.glsl',
            mesh: 'Common/Meshes/squareCentered.json',
            textures: [
                this.texturePath
            ]
        }

        result.vertexAttributes = {
            vertices: 'aVertexPosition',
            uv: 'aUvCoord'
        }

        result.uniformParameters.mat4['uObjectData.transform'] = Array.from(this.transform.worldTransform);
        result.uniformParameters.float['uObjectData.size'] = this.size;
        result.uniformParameters.float['uObjectData.opacity'] = this.opacity;
        result.uniformParameters.int['uObjectData.texSampler'] = 0;
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