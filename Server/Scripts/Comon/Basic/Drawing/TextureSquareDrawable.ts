import { DrawingSystem } from "@core/Systems/DrawingSystem";
import { Entity } from "@core/Base/Entity";
import { vec2 } from "gl-matrix"
import { Serialization } from "@shared/WorldSnapshot";

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

    takeSnapshot(): Serialization.Drawable.Snapshot {
        const result = super.takeSnapshot();

        result.assets.vertexShader = 'Common/Basic/Drawing/Texture.vs.glsl';
        result.assets.pixelShader = 'Common/Basic/Drawing/Texture.fs.glsl';
        result.assets.mesh = 'Common/Meshes/squareCentered.json';
        result.assets.textures[0] = this.texturePath;

        result.vertexAttributes.vertices = 'aVertexPosition';
        result.vertexAttributes.uv = 'aUvCoord';

        result.uniformParameters.mat4['uObjectData.transform'] = Array.from(this.transform.worldTransform);
        result.uniformParameters.float['uObjectData.size'] = this.size;
        result.uniformParameters.float['uObjectData.opacity'] = this.opacity;
        result.uniformParameters.int['uObjectData.texSampler'] = 0;
        result.uniformParameters.vec2['uObjectData.uvScale'] = Array.from(this.uvScale);
        result.uniformParameters.vec2['uObjectData.uvOffset'] = Array.from(this.uvOffset);

        return result;
    }
}