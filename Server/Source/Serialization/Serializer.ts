import { World } from "../World/World"
import { Entity } from "../Base/Entity"
import { TransformSystem } from "../Systems/TransformSystem";
import { DrawingSystem } from "../Systems/DrawingSystem";
import { throws } from "assert";
import { Recoverable } from "repl";
import { stringify } from "querystring";
import { PlayerIdentity } from "../Scripts/Player/PlayerIdentity";
import { PlayerInputController } from "../Scripts/Player/PlayerInputController";

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
        [ TransformSystem.Component.staticMetaName(), this.serializeTransformComponent ],
        [ DrawingSystem.Component.staticMetaName(), this.serializeDrawableComponent ],
        [ PlayerIdentity.staticMetaName(), this.serializePlayerIdentityComponent ]
    ]);

    static serializeEntity(entity: Readonly<Entity>): Record<string, any> {
        var output: Record<string, any> = {};
        output.name = entity.getUuid();
        output.components = {};
        const components = entity.getComponents();

        //console.log(this.serializableComponentsMapping);
        let i=0;
        this.serializableComponentsMapping.forEach((func: any, key: string) => {
            const components = entity.getComponentsByType(key);
            
            if (components.length > 0) {
                // but assume 1 for now
                func(output.components, components[0]);
            }
            i++;
        })

        return output;
    }

    static serializeTransformComponent(output: Record<string, any>, component: Readonly<TransformSystem.Component>) {
        output.transform = component.position;
        return output;
    }

    static serializeDrawableComponent(output: Record<string, any>, component: Readonly<DrawingSystem.Component>) {
        output.drawing = {
            assetPaths: component.getAssetsPaths(),
            type: DrawingSystem.Types[component.getType()]
        }
    }

    static serializePlayerIdentityComponent(output: Record<string, any>, component: Readonly<PlayerIdentity>) {
        output.playerIdentity = {
            name: component.name
        }
    }

}