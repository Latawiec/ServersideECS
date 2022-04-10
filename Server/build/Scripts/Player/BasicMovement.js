"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicMovement = void 0;
const ScriptSystem_1 = require("../../Systems/ScriptSystem");
const TransformSystem_1 = require("../../Systems/TransformSystem");
const PlayerInputController_1 = require("./PlayerInputController");
const gl_matrix_1 = require("gl-matrix");
class BasicMovement extends ScriptSystem_1.ScriptComponent {
    constructor(owner) {
        super(owner);
        this._playerInput = undefined;
        this._transform = undefined;
        const playerInputControllers = owner.getComponentsByType(PlayerInputController_1.PlayerInputController.name);
        if (playerInputControllers.length === 0) {
            console.log('%s could not be initialized. %s component required.', BasicMovement.name, PlayerInputController_1.PlayerInputController.name);
            this.isActive = false;
            return;
        }
        // Assume one
        this._playerInput = playerInputControllers[0];
        const transformComponents = owner.getComponentsByType(TransformSystem_1.TransformComponent.name);
        if (transformComponents.length === 0) {
            console.log('%s could not be initialized. %s component required.', BasicMovement.name, TransformSystem_1.TransformComponent.name);
            this.isActive = false;
            return;
        }
        // Assume one
        this._transform = transformComponents[0];
    }
    preUpdate() {
        throw new Error("Method not implemented.");
    }
    onUpdate() {
        var _a, _b, _c, _d, _e;
        if (this.isActive) {
            const movementDirection = [0, 0, 0];
            if ((_a = this._playerInput) === null || _a === void 0 ? void 0 : _a.isKeyPressed('w')) {
                movementDirection[1] += 1;
            }
            if ((_b = this._playerInput) === null || _b === void 0 ? void 0 : _b.isKeyPressed('s')) {
                movementDirection[1] -= 1;
            }
            if ((_c = this._playerInput) === null || _c === void 0 ? void 0 : _c.isKeyPressed('a')) {
                movementDirection[0] += 1;
            }
            if ((_d = this._playerInput) === null || _d === void 0 ? void 0 : _d.isKeyPressed('d')) {
                movementDirection[0] -= 1;
            }
            gl_matrix_1.vec3.normalize(movementDirection, movementDirection);
            const currentPosition = this._transform.position;
            const scaling = [0.1, 0.1, 0.1];
            const newPosition = gl_matrix_1.vec3.create();
            gl_matrix_1.vec3.multiply(newPosition, movementDirection, scaling);
            gl_matrix_1.vec3.add(newPosition, newPosition, currentPosition);
            (_e = this._transform) === null || _e === void 0 ? void 0 : _e.setPosition(newPosition);
        }
    }
    postUpdate() {
        throw new Error("Method not implemented.");
    }
}
exports.BasicMovement = BasicMovement;
