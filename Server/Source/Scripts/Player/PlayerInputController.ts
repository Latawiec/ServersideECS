import { throws } from "assert"
import { Entity } from "../../Base/Entity"
import { ClientConnectionSystem } from "../../Systems/ClientConnectionSystem"
import { ScriptSystem } from "../../Systems/ScriptSystem"
import { TransformSystem } from "../../Systems/TransformSystem"


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

        
        var _this = this;
        this._connection.onMessage = function (message: any) {
            _this.filterMessage(message)
        }
    }

    get metaName(): string {
        return PlayerInputController.staticMetaName();
    }


    isKeyPressed(keyCode: string): boolean {
        return this._keyStates.has(keyCode) && this._keyStates.get(keyCode)!;
    }

    preUpdate(): void {
        throw new Error("Method not implemented.");
    }

    onUpdate(): void {
        var enityTransforms = this.ownerEntity.getComponentsByType(TransformSystem.Component.staticMetaName());
        if (enityTransforms.length == 0) {
            // well?
            return;
        } 


    }
    postUpdate(): void {
        throw new Error("Method not implemented.");
    }

    filterMessage(message: any): any | undefined {
        const playerInputProp = 'playerInput';
        const keyPressedProp = 'keyPressed';
        const keyReleasedProp = 'keyReleased';

        if (message.hasOwnProperty(playerInputProp)) 
        {
            if (message[playerInputProp].hasOwnProperty(keyPressedProp)) {
                const keyCode = message[playerInputProp][keyPressedProp];
                if (!this._keyStates.has(keyCode) || this._keyStates.get(keyCode) === false) {
                    this._keyStates.set(keyCode, true);
                    console.log('Key pressed: %s', keyCode);
                }
            }

            if (message[playerInputProp].hasOwnProperty(keyReleasedProp)){
                const keyCode = message[playerInputProp][keyReleasedProp];
                if (!this._keyStates.has(keyCode) || this._keyStates.get(keyCode) === true) {
                    // Only notify if something has changed
                    this._keyStates.set(keyCode, false)
                    console.log('Key released: %s', keyCode);
                }
            }
        }
    }

}