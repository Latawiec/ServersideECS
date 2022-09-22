import { World } from "../World/World"
import { Entity } from "../Base/Entity"
import { AABBDrawableComponent, DrawableAoERectangleClosed, DrawingSystem, SpriteTexture } from "../Systems/DrawingSystem";
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
        const type = component.getType();
        let result : any = {};
        result.type = type;
        result.transform = component.transform.worldTransform;
        result.componentId = component.systemAsignedId;

        switch (type)
        {
            case DrawingSystem.Types.Unknown:
                // It'll do it by itself.
                component.serialize(output);
                return;
                break;
            case DrawingSystem.Types.SpriteTexture:
                const SpriteComponent = component as SpriteTexture;
                result.widthSegments = SpriteComponent.widthSegments;
                result.heightSegments = SpriteComponent.heightSegments;
                result.selectedSegment = [ SpriteComponent.selectedWidthSegment, SpriteComponent.selectedHeightSegment ];
                // fallthrough
            case DrawingSystem.Types.AABBRect:
                const AABBComponent = component as AABBDrawableComponent;
                result.assetPaths = component.getAssetsPaths();
                result.color = AABBComponent.color;
                break;
            case DrawingSystem.Types.AOE_CircleClosed:
                // It'll do it by itself.
                component.serialize(output);
                return;

                break;
            case DrawingSystem.Types.AOE_RectangleClosed:
                // It'll do it by itself.
                //component.serialize(output);
                return;

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

    static serializeCameraComponent(output: Record<string, any>, component: Readonly<CameraSystem.Component>) {
        component.serialize(output);
    }

}