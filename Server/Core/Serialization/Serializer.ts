import { World } from "../World/World"
import { Serialization } from "@shared/WorldSnapshot"
import { DrawingSystem } from "@core/Systems/DrawingSystem";
import { CameraSystem } from "@core/Systems/CameraSystem";
import { Uuid } from "@core/Base/UuidGenerator"

export class Serializer {

    static serializableComponentsMapping = new Map<string, any>([
        [ DrawingSystem.Component.staticMetaName(), Serializer.addDrawableSnapshot ],
        [ CameraSystem.Component.staticMetaName(), Serializer.addCameraSnapshot ]
    ]);


    private _worldSnapshot: Serialization.WorldSnapshot = new Serialization.WorldSnapshot();

    update(world: Readonly<World>) {
        const result = new Serialization.WorldSnapshot();
        const worldEntities = world.getEntites();

        for (const entity of worldEntities) {

            for (const [staticMetaName, snapshotFunction] of Serializer.serializableComponentsMapping) {
                const componentsOfType = entity.getComponentsByType(staticMetaName);

                for (const component of componentsOfType) {
                    snapshotFunction(result, component.systemAsignedId, component);
                }
            }
        }

        this._worldSnapshot = result;
    }

    private static addDrawableSnapshot(snapshot: Readonly<Serialization.WorldSnapshot>, id: Uuid, component: Serialization.ISnapshot<Serialization.Drawable.Snapshot>) {
        snapshot.drawable[id] = component.takeSnapshot();
    }

    private static addCameraSnapshot(snapshot: Readonly<Serialization.WorldSnapshot>, id: Uuid, component: Serialization.ISnapshot<Serialization.Camera.Snapshot>) {
        snapshot.camera[id] = component.takeSnapshot();
    }


    toJson(): string {
        return JSON.stringify(this._worldSnapshot);
    }

}