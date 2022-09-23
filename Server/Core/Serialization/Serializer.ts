import { World } from "../World/World"
import { Entity } from "../Base/Entity"
import { DrawingSystem } from "../Systems/DrawingSystem";
import { PlayerIdentity } from "@scripts/Comon/Player/PlayerIdentity";
import { CameraSystem } from "@systems/CameraSystem"
import { assert } from "console";

export class WorldSerializer
{
    static serializeWorld(world: Readonly<World>): Record<string, any> {
        var output: Record<string, any> = {};
        output.entities = [];
        const entities = world.getEntites();

        for(let i=0; i<entities.length; i++) {
            output.entities.push(this.serializeEntity(entities[i]));
        }

        return output;
    }

    static serializableComponentsMapping = new Map<string, any>([
        [ DrawingSystem.Component.staticMetaName(), this.serializeDrawableComponent ],
        [ PlayerIdentity.staticMetaName(), this.serializePlayerIdentityComponent ],
        [ CameraSystem.Component.staticMetaName(), this.serializeCameraComponent ]
    ]);

    static serializeEntity(entity: Readonly<Entity>): Record<string, any> {
        var output: Record<string, any> = {};
        output.name = entity.uuid;
        output.components = {};
        const components = entity.components;

        this.serializableComponentsMapping.forEach((func: any, key: string) => {
            const components = entity.getComponentsByType(key);
            for (const component of components) {
                func(output.components, component);
            }
        })

        return output;
    }

    static serializeDrawableComponent(output: Record<string, any>, component: Readonly<DrawingSystem.Component>) {
        if (!output.drawableComponents) {
            output.drawableComponents = []
        }
        const serialized = component.serialize();
        if (serialized) {
            (output.drawableComponents as Array<any>).push(serialized);
        }
    }

    static serializePlayerIdentityComponent(output: Record<string, any>, component: Readonly<PlayerIdentity>) {
        output.playerIdentity = {
            name: component.name
        }
    }

    static serializeCameraComponent(output: Record<string, any>, component: Readonly<CameraSystem.Component>) {
        // TODO: Handle multiple cameras?
        output.camera = component.serialize();
    }

}