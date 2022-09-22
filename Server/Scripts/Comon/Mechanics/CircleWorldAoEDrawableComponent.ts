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

    getType(): DrawingSystem.Types {
        return DrawingSystem.Types.AOE_CircleClosed;
    }

    serialize(output: Record<string, any>): Record<string, any> {
        let result = super.serialize(output);

        result.assetPaths = {
            vertexShader: 'Common/Mechanics/CircleWorldAoE.vs.glsl',
            pixelShader: 'Common/Mechanics/CircleWorldAoE.fs.glsl',
            mesh: 'Common/Meshes/square.json'
        }

        result.vertexAttributes = {
            vertices: 'aVertexPosition',
            uv: 'aUvCoord'
        }

        result.uniformParameters = {
            'uObjectData.transform':Array.from(this.transform.worldTransform),
            'uObjectData.radius': this.radius,
            'uObjectData.opacity': this.opacity,
            'uObjectData.intensity': this.intensity,

            'uTimeData.globalTime': GlobalClock.clock.getTimeMs()
        };

        return result;
    }
}