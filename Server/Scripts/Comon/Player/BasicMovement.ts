import { Entity } from "@core/Base/Entity";
import { Transform } from "@core/Base/Transform";
import { ScriptSystem } from "@systems/ScriptSystem";
import { PlayerInputController } from "./PlayerInputController";
import { vec3 } from "gl-matrix"



export class BasicMovement extends ScriptSystem.Component {
    // Metadata

    private _playerInput: PlayerInputController | undefined = undefined;
    private _playerTransform: Transform;

    private _movementDirection: vec3 = [0, 0, 0];

    constructor(owner: Entity) {
        super(owner);
        this._playerTransform = owner.transform;

        const playerInputControllers = owner.getComponentsByType(PlayerInputController.staticMetaName());
        if (playerInputControllers.length === 0) {
            console.log('%s could not be initialized. %s component required.',
                BasicMovement.staticMetaName(),
                PlayerInputController.staticMetaName()
            );
            this.isActive = false;
            return;
        }
        // Assume one
        this._playerInput = playerInputControllers[0] as PlayerInputController;

    }

    preUpdate(): void {
        // throw new Error("Method not implemented.");
    }
    onUpdate(): void {
        if (this.isActive) {
            const movementDirection: vec3 = [0, 0, 0];

            if (this._playerInput?.isKeyPressed('w')) {
                movementDirection[2] += 1;
            }

            if (this._playerInput?.isKeyPressed('s')) {
                movementDirection[2] -= 1;
            }

            if (this._playerInput?.isKeyPressed('a')) {
                movementDirection[0] += 1;
            }

            if (this._playerInput?.isKeyPressed('d')) {
                movementDirection[0] -= 1;
            }

            vec3.normalize(movementDirection, movementDirection);
            this._movementDirection = movementDirection;

            const scaling: vec3 = [0.1, 0.1, 0.1];
            const motionVector = vec3.mul(vec3.create(), movementDirection, scaling);
            this._playerTransform.move(motionVector);
        }
    }
    postUpdate(): void {
        // throw new Error("Method not implemented.");
    }

    get direction() {
        return this._movementDirection;
    }
    
}