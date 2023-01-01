import { Entity } from "@core/Base/Entity";
import { GlobalClock } from "@core/Base/GlobalClock";
import { CameraSystem } from "@core/Systems/CameraSystem";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { mat4, vec3 } from "gl-matrix";


export class OverviewCamera extends ScriptSystem.Component {
    private cameraComponent: CameraSystem.Component;
    private captureSize = 30;

    constructor(parent: Entity) {
        const entity = parent.world.createEntity(parent);
        super(entity);
        this.cameraComponent = new CameraSystem.Component(entity);

        const projectionMatrix = mat4.create();
        mat4.identity(projectionMatrix);
        const fovy = 45.0 * Math.PI / 180.0;
        const aspect = 1200.0 / 1200.0;
        const near = 0.01;
        const far = 1000;

        this.cameraComponent.projection =  mat4.perspective(
            projectionMatrix,
            fovy,
            aspect,
            near,
            far
        )

        // this.cameraComponent.projection = mat4.ortho(
        //     projectionMatrix,
        //     -this.captureSize, this.captureSize,
        //     -this.captureSize, this.captureSize,
        //     near,
        //     far
        // );

        const viewTransform = mat4.create();
        this.cameraComponent.transform = mat4.lookAt(viewTransform,
            vec3.fromValues(0, 2*this.captureSize, -2*this.captureSize),
            vec3.fromValues(0, 0, 0),
            vec3.fromValues(0, 1, 0)
        );
    }

    preUpdate(): void {    
    }

    onUpdate(): void {
        //this.ownerEntity.transform.rotate([0, 1, 0], 0.01);
    }

    postUpdate(): void {
    }
}