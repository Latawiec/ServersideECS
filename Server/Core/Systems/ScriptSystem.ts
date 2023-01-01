import { ComponentBase } from "../Base/Component"
import { MetaName, SystemBase } from "../Base/System";


export namespace ScriptSystem {

    export abstract class Component extends ComponentBase {
        // Metadata 
        static staticMetaName(): string { return 'ScriptSystem.Component' }

        get systemMetaName(): MetaName {
            return System.staticMetaName();
        }

        get metaName(): MetaName {
            return Component.staticMetaName();
        }
    
        abstract preUpdate(): void;
        abstract onUpdate(): void;
        abstract postUpdate(): void;
    }


    export class System extends SystemBase<Component> {
        // Metadata
        static staticMetaName(): MetaName { return 'ScriptSystem.System' }
    
        // SystemBase implementation
        get metaName(): MetaName {
            return System.staticMetaName();
        }
    
        preUpdate(): void {
            this._getComponentsMap().forEach(entry => {
                if (entry.isActive) {
                    entry.preUpdate();
                }
            });
        }
    
        onUpdate(): void {
            this._getComponentsMap().forEach(entry => {
                if (entry.isActive) {
                    entry.onUpdate();
                }
            });
        }
    
        postUpdate(): void {
            this._getComponentsMap().forEach(entry => {
                if (entry.isActive) {
                    entry.postUpdate();
                }
            });
        }
    }

} // namespace Script System