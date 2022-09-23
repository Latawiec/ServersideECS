import { DrawingSystem } from "@core/Systems/DrawingSystem";
import { Entity } from "@core/Base/Entity";
import { vec3 } from "gl-matrix"

export class WaymarkBaseDrawable extends DrawingSystem.Component {

    color: vec3 = vec3.fromValues(1, 0, 0);
    opacity: number = 1.0

    constructor(entity: Entity) {
        super(entity);
    }

    getType(): DrawingSystem.Types {
        return DrawingSystem.Types.Unknown;
    }

    serialize(output: Record<string, any>): Record<string, any> {
        let result = super.serialize(output);

        
        result.assetPaths = {
            vertexShader: 'Common/Waymarks/Waymark.vs.glsl',
            pixelShader: 'Common/Waymarks/Waymark.fs.glsl',
            mesh: 'Common/Meshes/square.json'
        }

        result.vertexAttributes = {
            vertices: 'aVertexPosition',
            uv: 'aUvCoord'
        }

        result.uniformParameters.mat4['uObjectData.transform'] = Array.from(this.transform.worldTransform);
        result.uniformParameters.float['uObjectData.opacity'] = this.opacity;
        result.uniformParameters.vec3['uObjectData.color'] = this.color;

        return result;
    }
}