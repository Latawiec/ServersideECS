import { EventfulComponentBase } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { MetaName, SystemBase } from "../Base/System";

export namespace ClientConnectionSystem {

    export class Component extends EventfulComponentBase {
        static staticMetaName(): MetaName { return 'ClientConnectionSystem.Component' }
    
        constructor(owner: Entity) {
            super(owner)
        }

        get systemMetaName(): MetaName {
            return System.staticMetaName();
        }

        get metaName(): MetaName {
            return Component.staticMetaName();
        }

        on(event: 'keyPressed', cb: (key: string) => void): this;
        on(event: 'keyReleased', cb: (key: string) => void): this;
        on(event: string | symbol, cb: (arg: any)=>void): this {
            return super.on(event, cb)
        }

        addListener(event: 'keyPressed', cb: (key: string) => void): this;
        addListener(event: 'keyReleased', cb: (key: string) => void): this;
        addListener(eventName: string | symbol, cb: (arg: any) => void): this {
            return super.addListener(eventName, cb)
        }

        emit(event: 'keyPressed', key: string): boolean;
        emit(event: 'keyReleased', key: string): boolean;
        emit(event: string | symbol, arg: any): boolean {
            return super.emit(event, arg);
        }
    };

    export class System extends SystemBase<Component> {
        // Metadata
        static staticMetaName(): MetaName { return 'ClientConnectionSystem.System' }

        // SystemBase implementation
        get metaName(): MetaName {
            return System.staticMetaName();
        }
    }

}; // namespace ClientConnectionSystem
