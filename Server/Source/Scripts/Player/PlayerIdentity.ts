import { Entity } from "../../Base/Entity";
import { ScriptComponent } from "../../Systems/ScriptSystem";




export class PlayerIdentity extends ScriptComponent {
    private _name: string;

    constructor(owner: Entity, name: string) {
        super(owner);
        this._name = name;
    }

    get name() {
        return this._name;
    }

    get metaName(): string {
        return PlayerIdentity.name;
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