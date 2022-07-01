import { World } from "../World/World"
import { Entity } from "../Base/Entity"
import { TransformSystem } from "../Systems/TransformSystem";
import { AABBDrawableComponent, DrawingSystem, SpriteTexture } from "../Systems/DrawingSystem";
import { throws } from "assert";
import { Recoverable } from "repl";
import { stringify } from "querystring";
import { PlayerIdentity } from "../Scripts/Player/PlayerIdentity";
import { PlayerInputController } from "../Scripts/Player/PlayerInputController";
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
        const type = component.getType();
        let result : any = {};
        result.type = type;

        switch (type)
        {
            case DrawingSystem.Types.SpriteTexture:
                const SpriteComponent = component as SpriteTexture;
                result.widthSegments = SpriteComponent.widthSegments;
                result.heightSegments = SpriteComponent.heightSegments;
                result.selectedSegment = [ SpriteComponent.selectedWidthSegment, SpriteComponent.selectedHeightSegment ];
                // fallthrough
            case DrawingSystem.Types.AABBRect:
                const AABBComponent = component as AABBDrawableComponent;
                result.assetPaths = component.getAssetsPaths();
                break;
            default:
                assert(false, "Can't convert Drawable type: " + type);
        }

        output.drawing = result;
    }

    static serializePlayerIdentityComponent(output: Record<string, any>, component: Readonly<PlayerIdentity>) {
        output.playerIdentity = {
            name: component.name
        }
    }

}