import { Entity } from "@core/Base/Entity"
import { ClientConnectionSystem } from "@systems/ClientConnectionSystem"
import { ScriptSystem } from "@systems/ScriptSystem"


export class PlayerInputController extends ScriptSystem.Component {
    // Metadata
    static staticMetaName(): string { return 'PlayerInputController' }

    private _connection: ClientConnectionSystem.Component | undefined = undefined; 
    private _keyStates: Map<string, boolean>;
    
    constructor(owner: Entity) {
        super(owner);
        this._keyStates = new Map<string, boolean>();

        const connectionComponents = owner.getComponentsByType(ClientConnectionSystem.Component.staticMetaName());
        if (connectionComponents.length === 0) {
            console.log('%s could not be initialized. %s component required.',
                PlayerInputController.staticMetaName(),
                ClientConnectionSystem.Component.staticMetaName()
            );
            return;
        }
        // Assume one.
        this._connection = connectionComponents[0] as ClientConnectionSystem.Component;
        this._connection.on('keyPressed', (key: string) => {
            // TODO: For some reason I'm getting an array, not a string.
            this._keyStates.set(key[0], true);
        })
        this._connection.on('keyReleased', (key: string) => { this._keyStates.set(key[0], false); })
    }

    get metaName(): string {
        return PlayerInputController.staticMetaName();
    }

    isKeyPressed(keyCode: string): boolean {
        return this._keyStates.has(keyCode) && this._keyStates.get(keyCode)!;
    }

    preUpdate(): void {
    }

    onUpdate(): void {
    }

    postUpdate(): void {
    }
}