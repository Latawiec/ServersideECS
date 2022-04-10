"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerIdentity = void 0;
const ScriptSystem_1 = require("../../Systems/ScriptSystem");
class PlayerIdentity extends ScriptSystem_1.ScriptComponent {
    constructor(owner, name) {
        super(owner);
        this._name = name;
    }
    get name() {
        return this._name;
    }
    get metaName() {
        return PlayerIdentity.name;
    }
    preUpdate() {
        //throw new Error("Method not implemented.");
    }
    onUpdate() {
        //throw new Error("Method not implemented.");
    }
    postUpdate() {
        //throw new Error("Method not implemented.");
    }
}
exports.PlayerIdentity = PlayerIdentity;
