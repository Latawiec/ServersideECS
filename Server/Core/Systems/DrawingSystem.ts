import { ComponentBase } from "../Base/Component"
import { MetaName, SystemBase } from "../Base/System"
import { Transform } from "../Base/Transform";
import { Serialization } from "@shared/WorldSnapshot";


export namespace DrawingSystem {

    enum Blending {
        Transparency,
        Opaque,
        Additive,
    };

    export abstract class Component extends ComponentBase implements Serialization.ISnapshot<Serialization.Drawable.Snapshot> {
        // Metadata
        static staticMetaName(): MetaName { return 'DrawingSystem.Component' }

        transform: Transform = new Transform();
        blending: Blending = Blending.Transparency;


        takeSnapshot(): Serialization.Drawable.Snapshot {
            const result = new Serialization.Drawable.Snapshot();

            result.transform = Array.from(this.transform.worldTransform);

            return result;
        }
    
        get metaName(): MetaName {
            return Component.staticMetaName();
        }

        get systemMetaName(): MetaName {
            return System.staticMetaName();
        }
    }

    export class System extends SystemBase<Component> {
        // Metaname 
        static staticMetaName(): MetaName { return 'DrawingSystem.System' }

        // SystemBase implementation
        get metaName(): MetaName {
            return System.staticMetaName();
        }

        update() {
            for(const componentEntry of this._getComponentsMap()) 
            {
                const component = componentEntry[1] as DrawingSystem.Component;
                component.transform.updateWorldTransform(component.ownerEntity.transform.worldTransform);
            }
        }
    }

};
