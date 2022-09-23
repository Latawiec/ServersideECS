import { DrawingSystem } from "@core/Systems/DrawingSystem";
import { Entity } from "@core/Base/Entity";
import { deprecate } from "util";

export class TextureSquareDrawable extends DrawingSystem.Component {

    size: number = 1;
    texturePath: string;
    opacity: number = 1;

    constructor(entity: Entity, texturePath: string, size: number = 1) {
        super(entity)
        this.texturePath = texturePath;
        this.size = size;
    }

    // TODO: This should be removed soon. Client side no longer has to recognize these.
    getType(): DrawingSystem.Types {
        return DrawingSystem.Types.Unknown;
    }

    serialize(output: Record<string, any>): Record<string, any> {
        let result = super.serialize(output);

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

        return result;
    }
}