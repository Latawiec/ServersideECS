import { DrawingSystem } from "@core/Systems/DrawingSystem";
import { Entity } from "@core/Base/Entity";
import { GlobalClock } from "@core/Base/GlobalClock";
import { mat4 } from 'gl-matrix'
import { Serialization } from "@core/Serialization/WorldSnapshot";

export class CircleWorldAoEDrawableComponent extends DrawingSystem.Component {

    radius: number = 1;
    opacity: number = 1;
    intensity: number = 1;

    constructor(entity: Entity, radius: number = 1) {
        super(entity);
        this.radius = radius;
    }

    takeSnapshot(): Serialization.Drawable.Snapshot {
        const result = new Serialization.Drawable.Snapshot;

        result.assets.vertexShader = 'Common/Mechanics/CircleWorldAoE.vs.glsl';
        result.assets.pixelShader = 'Common/Mechanics/CircleWorldAoE.fs.glsl';
        result.assets.mesh = 'Common/Meshes/square.json';

        result.vertexAttributes.vertices = 'aVertexPosition';
        result.vertexAttributes.uv = 'aUvCoord';

        result.uniformParameters.mat4['uObjectData.transform'] = Array.from(this.transform.worldTransform);
        result.uniformParameters.float['uObjectData.radius'] = this.radius;
        result.uniformParameters.float['uObjectData.opacity'] = this.opacity;
        result.uniformParameters.float['uObjectData.intensity'] = this.intensity;
        result.uniformParameters.float['uTimeData.globalTime'] = GlobalClock.clock.getTimeMs();

        return result;
    }
}