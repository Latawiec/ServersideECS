import { DrawingSystem } from "@core/Systems/DrawingSystem";
import { Entity } from "@core/Base/Entity";
import { GlobalClock } from "@core/Base/GlobalClock";
import { mat4 } from 'gl-matrix'

export class CircleWorldAoEDrawableComponent extends DrawingSystem.Component {

    radius: number = 1;
    opacity: number = 1;
    intensity: number = 1;

    constructor(entity: Entity, radius: number = 1) {
        super(entity);
        this.radius = radius;
    }

    serialize(): Record<string, any> {
        let result = super.serialize();

        result.assetPaths = {
            vertexShader: 'Common/Mechanics/CircleWorldAoE.vs.glsl',
            pixelShader: 'Common/Mechanics/CircleWorldAoE.fs.glsl',
            mesh: 'Common/Meshes/square.json'
        }

        result.vertexAttributes = {
            vertices: 'aVertexPosition',
            uv: 'aUvCoord'
        }

        result.uniformParameters.mat4['uObjectData.transform'] = Array.from(this.transform.worldTransform);
        result.uniformParameters.float['uObjectData.radius'] = this.radius;
        result.uniformParameters.float['uObjectData.opacity'] = this.opacity;
        result.uniformParameters.float['uObjectData.intensity'] = this.intensity;
        result.uniformParameters.float['uTimeData.globalTime'] = GlobalClock.clock.getTimeMs();

        return result;
    }
}