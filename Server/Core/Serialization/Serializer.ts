import { World } from "../World/World"
import { Entity } from "../Base/Entity"
import { DrawingSystem } from "../Systems/DrawingSystem";
import { PlayerIdentity } from "@scripts/Comon/Player/PlayerIdentity";
import { CameraSystem } from "@systems/CameraSystem"
import { assert } from "console";
import { transform, isEqual, isArray, isObject } from "lodash";

export class WorldSerializer
{
    private _previousWorld: Record<string, any> = {};
    private _diff: Record<string, any> | undefined = {};

    constructor() {}

    /**
     * Find difference between two objects
     * @param  {object} origObj - Source object to compare newObj against
     * @param  {object} newObj  - New object with potential changes
     * @return {object} differences
     */
    static difference(origObj: Record<string, any>, newObj: Record<string, any>) {
        function changes(newObj: Record<string, any>, origObj: Record<string, any>) : Record<string, any> {
        let arrayIndexCounter = 0
        return transform(newObj, function (result: Record<string, any>, value, key) {
            if (!isEqual(value, origObj[key])) {
            let resultKey = isArray(origObj) ? arrayIndexCounter++ : key
            result[resultKey] = (isObject(value) && isObject(origObj[key])) ? changes(value, origObj[key]) : value
            }
        })
        }
        return changes(newObj, origObj)
    }

    serializeWorld(world: Readonly<World>): Record<string, any> {
        var output: Record<string, any> = {};
        output.entities = {};
        const entities = world.getEntites();

        for(let i=0; i<entities.length; i++) {
            output.entities[entities[i].uuid] = WorldSerializer.serializeEntity(entities[i]);
        }
        this._diff = WorldSerializer.difference(this._previousWorld, output);
        this._previousWorld = output;

        return output;
    }

    worldDiff(): Record<string, any> {
        return this._diff ? this._diff : {};
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
            output.drawableComponents = {}
        }
        const serialized = component.serialize();
        if (serialized) {
            output.drawableComponents[component.systemAsignedId!] = serialized;
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