import { Entity } from "@core/Base/Entity";
import { CameraSystem } from "@core/Systems/CameraSystem";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { mat4, vec3 } from "gl-matrix";


export class OverviewCamera extends ScriptSystem.Component {
    private cameraComponent: CameraSystem.Component;
    private captureSize = 30;

    constructor(owner: Entity) {
        super(owner);
        this.cameraComponent = new CameraSystem.Component(owner);

        const projectionMatrix = mat4.create();
        mat4.identity(projectionMatrix);
        const fovy = 45.0 * Math.PI / 180.0;
        const aspect = 1200.0 / 1200.0;
        const near = -100;
        const far = 100;

        this.cameraComponent.projection = mat4.ortho(
            projectionMatrix,
            -this.captureSize, this.captureSize,
            -this.captureSize, this.captureSize,
            near,
            far
        );

        const viewTransform = mat4.create();
        this.cameraComponent.transform = mat4.lookAt(viewTransform,
            vec3.fromValues(0, 1, -1),
            vec3.fromValues(0, 0, 0),
            vec3.fromValues(0, 1, 0)
        );
    }

    preUpdate(): void {    
    }

    onUpdate(): void {
    }

    postUpdate(): void {
    }
}