import { DrawingSystem } from "@core/Systems/DrawingSystem";
import { Entity } from "@core/Base/Entity";
import { vec2 } from "gl-matrix"

export class TextureSquareDrawable extends DrawingSystem.Component {

    size: number = 1;
    texturePath: string;
    opacity: number = 1;
    uvScale: vec2 = [1, 1];
    uvOffset: vec2 = [0, 0];

    constructor(entity: Entity, texturePath: string, size: number = 1) {
        super(entity)
        this.texturePath = texturePath;
        this.size = size;
    }

    serialize(): Record<string, any> {
        let result = super.serialize();

        result.assetPaths = {
            vertexShader: 'Common/Basic/Drawing/Texture.vs.glsl',
            pixelShader: 'Common/Basic/Drawing/Texture.fs.glsl',
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
        result.uniformParameters.vec2['uObjectData.uvScale'] = this.uvScale;
        result.uniformParameters.vec2['uObjectData.uvOffset'] = this.uvOffset;

        return result;
    }
}