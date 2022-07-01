import { throws } from "assert";
import { Entity } from "../../Base/Entity";
import { ScriptSystem } from "../../Systems/ScriptSystem";
import { TransformSystem } from "../../Systems/TransformSystem";
import { PlayerInputController } from "./PlayerInputController";
import { vec3 } from "gl-matrix"



export class BasicMovement extends ScriptSystem.Component {
    // Metadata

    private _playerInput: PlayerInputController | undefined = undefined;
    private _transform: TransformSystem.Component | undefined = undefined;

    private _movementDirection: vec3 = [0, 0, 0];

    constructor(owner: Entity) {
        super(owner);

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

        const transformComponents = owner.getComponentsByType(TransformSystem.Component.staticMetaName());
        if (transformComponents.length === 0) {
            console.log('%s could not be initialized. %s component required.',
                BasicMovement.staticMetaName(),
                TransformSystem.Component.staticMetaName()
            );
            this.isActive = false;
            return;
        }
        // Assume one
        this._transform = transformComponents[0] as TransformSystem.Component;
    }

    preUpdate(): void {
        // throw new Error("Method not implemented.");
    }
    onUpdate(): void {
        if (this.isActive) {
            const movementDirection: vec3 = [0, 0, 0];

            if (this._playerInput?.isKeyPressed('w')) {
                movementDirection[1] += 1;
            }

            if (this._playerInput?.isKeyPressed('s')) {
                movementDirection[1] -= 1;
            }

            if (this._playerInput?.isKeyPressed('a')) {
                movementDirection[0] += 1;
            }

            if (this._playerInput?.isKeyPressed('d')) {
                movementDirection[0] -= 1;
            }

            vec3.normalize(movementDirection, movementDirection);
            this._movementDirection = movementDirection;

            const currentPosition = this._transform!.position;
            const scaling: vec3 = [0.1, 0.1, 0.1];
            const newPosition = vec3.create();
            vec3.multiply(newPosition, movementDirection, scaling);
            vec3.add(newPosition, newPosition, currentPosition);
            this._transform?.setPosition(newPosition);
        }
    }
    postUpdate(): void {
        // throw new Error("Method not implemented.");
    }

    get direction() {
        return this._movementDirection;
    }
    
}