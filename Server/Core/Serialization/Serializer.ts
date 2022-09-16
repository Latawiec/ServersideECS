import { World } from "../World/World"
import { Entity } from "../Base/Entity"
import { AABBDrawableComponent, DrawableAoECircleClosed, DrawableAoERectangleClosed, DrawingSystem, SpriteTexture } from "../Systems/DrawingSystem";
import { throws } from "assert";
import { Recoverable } from "repl";
import { stringify } from "querystring";
import { PlayerIdentity } from "../Scripts/Player/PlayerIdentity";
import { CameraSystem } from "../Systems/CameraSystem"
import { PlayerInputController } from "../Scripts/Player/PlayerInputController";
import { assert } from "console";
import { mat4 } from "gl-matrix"

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
        output.name = entity.getUuid();
        output.components = {};
        output.components.transform = entity.getTransform().worldTransform;
        const components = entity.getComponents();

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

    static serializeDrawableComponent(output: Record<string, any>, component: Readonly<DrawingSystem.Component>) {
        const type = component.getType();
        let result : any = {};
        result.type = type;
        result.transform = component.transform.worldTransform;

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
                result.color = AABBComponent.color;
                break;
            case DrawingSystem.Types.AOE_CircleClosed:
                const AoECircleComponent = component as DrawableAoECircleClosed;
                result.radius = AoECircleComponent.radius;
                break;
            case DrawingSystem.Types.AOE_RectangleClosed:
                const AoERectangleComponent = component as DrawableAoERectangleClosed;
                result.width = AoERectangleComponent.width;
                result.height = AoERectangleComponent.height;
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
        output.camera = {
            transform: component.worldTransform,
            projection: component.projection
        }
    }

}