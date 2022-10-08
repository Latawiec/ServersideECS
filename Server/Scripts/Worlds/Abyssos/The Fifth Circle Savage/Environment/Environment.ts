import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { Platform } from "./Platform"


export class Environment extends ScriptSystem.Component {

    private platform: Platform;

    constructor(owner: Entity) {
        super(owner);

        this.platform = new Platform(owner.world.createEntity(owner));

        this.isActive = false;
    }

    preUpdate(): void {
    }
    onUpdate(): void {
    }
    postUpdate(): void {
    }

}