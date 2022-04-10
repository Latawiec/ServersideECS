"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerInputController = void 0;
const ClientConnectionSystem_1 = require("../../Systems/ClientConnectionSystem");
const ScriptSystem_1 = require("../../Systems/ScriptSystem");
const TransformSystem_1 = require("../../Systems/TransformSystem");
class PlayerInputController extends ScriptSystem_1.ScriptComponent {
    constructor(owner) {
        super(owner);
        this._connection = undefined;
        this._keyStates = new Map();
        const connectionComponents = owner.getComponentsByType(ClientConnectionSystem_1.ClientConnectionComponent.name);
        if (connectionComponents.length === 0) {
            console.log('%s could not be initialized. %s component required.', PlayerInputController.name, ClientConnectionSystem_1.ClientConnectionComponent.name);
            return;
        }
        // Assume one.
        this._connection = connectionComponents[0];
        var _this = this;
        this._connection.onMessage = function (message) {
            _this.filterMessage(message);
        };
    }
    get metaName() {
        return PlayerInputController.name;
    }
    isKeyPressed(keyCode) {
        return this._keyStates.has(keyCode) && this._keyStates.get(keyCode);
    }
    preUpdate() {
        throw new Error("Method not implemented.");
    }
    onUpdate() {
        var enityTransforms = this.ownerEntity.getComponentsByType(TransformSystem_1.TransformComponent.name);
        if (enityTransforms.length == 0) {
            // well?
            return;
        }
    }
    postUpdate() {
        throw new Error("Method not implemented.");
    }
    filterMessage(message) {
        const playerInputProp = 'playerInput';
        const keyPressedProp = 'keyPressed';
        const keyReleasedProp = 'keyReleased';
        if (message.hasOwnProperty(playerInputProp)) {
            if (message[playerInputProp].hasOwnProperty(keyPressedProp)) {
                const keyCode = message[playerInputProp][keyPressedProp];
                if (!this._keyStates.has(keyCode) || this._keyStates.get(keyCode) === false) {
                    this._keyStates.set(keyCode, true);
                    console.log('Key pressed: %s', keyCode);
                }
            }
            if (message[playerInputProp].hasOwnProperty(keyReleasedProp)) {
                const keyCode = message[playerInputProp][keyReleasedProp];
                if (!this._keyStates.has(keyCode) || this._keyStates.get(keyCode) === true) {
                    // Only notify if something has changed
                    this._keyStates.set(keyCode, false);
                    console.log('Key released: %s', keyCode);
                }
            }
        }
    }
}
exports.PlayerInputController = PlayerInputController;
