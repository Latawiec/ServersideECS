import { DrawingSystem } from "@core/Systems/DrawingSystem";
import { Entity } from "@core/Base/Entity";
import { vec3 } from "gl-matrix"
import { Serialization } from "@core/Serialization/WorldSnapshot";

export class WaymarkBaseDrawable extends DrawingSystem.Component {

    color: vec3 = vec3.fromValues(1, 0, 0);
    opacity: number = 1.0

    constructor(entity: Entity) {
        super(entity);
    }

    takeSnapshot(): Serialization.Drawable.Snapshot {
        const result = super.takeSnapshot();

        result.assets.vertexShader = 'Common/Waymarks/Waymark.vs.glsl';
        result.assets.pixelShader = 'Common/Waymarks/Waymark.fs.glsl';
        result.assets.mesh = 'Common/Meshes/squareCentered.json';

        result.vertexAttributes.vertices = 'aVertexPosition';
        result.vertexAttributes.uv = 'aUvCoord';

        result.uniformParameters.mat4['uObjectData.transform'] = Array.from(this.transform.worldTransform);
        result.uniformParameters.float['uObjectData.opacity'] = this.opacity;
        result.uniformParameters.vec3['uObjectData.color'] = Array.from(this.color);

        return result;
    }
}