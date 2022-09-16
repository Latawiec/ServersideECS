import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@systems/ScriptSystem";

export class PlayerIdentity extends ScriptSystem.Component {
    static staticMetaName(): string { return 'PlayerIdentity' }
    private _name: string;

    constructor(owner: Entity, name: string) {
        super(owner);
        this._name = name;
    }

    get name() {
        return this._name;
    }

    get metaName(): string {
        return PlayerIdentity.staticMetaName();
    }

    preUpdate(): void {
        //throw new Error("Method not implemented.");
    }
    onUpdate(): void {
        //throw new Error("Method not implemented.");
    }
    postUpdate(): void {
        //throw new Error("Method not implemented.");
    }

}