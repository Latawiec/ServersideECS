"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldSerializer = void 0;
const TransformSystem_1 = require("../Systems/TransformSystem");
const DrawableSystem_1 = require("../Systems/DrawableSystem");
const PlayerIdentity_1 = require("../Scripts/Player/PlayerIdentity");
class WorldSerializer {
    static serializeWorld(world) {
        var output = {};
        output.entities = [];
        const entities = world.getEntites();
        for (let i = 0; i < entities.length; i++) {
            output.entities.push(this.serializeEntity(entities[i]));
        }
        return output;
    }
    static serializeEntity(entity) {
        var output = {};
        output.name = entity.getUuid();
        output.components = {};
        const components = entity.getComponents();
        //console.log(this.serializableComponentsMapping);
        let i = 0;
        this.serializableComponentsMapping.forEach((func, key) => {
            const components = entity.getComponentsByType(key);
            if (components.length > 0) {
                // but assume 1 for now
                func(output.components, components[0]);
            }
            i++;
        });
        return output;
    }
    static serializeTransformComponent(output, component) {
        output.transform = component.position;
        return output;
    }
    static serializeDrawableComponent(output, component) {
        output.drawing = {
            assetPaths: component.getAssetsPaths(),
            type: DrawableSystem_1.DrawableTypes[component.getType()]
        };
    }
    static serializePlayerIdentityComponent(output, component) {
        output.playerIdentity = {
            name: component.name
        };
    }
}
exports.WorldSerializer = WorldSerializer;
_a = WorldSerializer;
WorldSerializer.serializableComponentsMapping = new Map([
    [TransformSystem_1.TransformComponent.name, _a.serializeTransformComponent],
    [DrawableSystem_1.DrawableComponent.name, _a.serializeDrawableComponent],
    [PlayerIdentity_1.PlayerIdentity.name, _a.serializePlayerIdentityComponent]
]);
