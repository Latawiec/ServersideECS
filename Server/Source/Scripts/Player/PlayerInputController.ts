import { throws } from "assert";
import { Entity } from "../../Base/Entity";
import { ClientConnectionComponent, OnMessage } from "../../Systems/ClientConnectionSystem";
import { ScriptComponent } from "../../Systems/ScriptSystem"
import { TransformComponent } from "../../Systems/TransformSystem"

export class PlayerInputController extends ScriptComponent {
    private _connection: ClientConnectionComponent | undefined = undefined; 
    private _keyStates: Map<string, boolean>;
    
    constructor(owner: Entity) {
        super(owner);
        this._keyStates = new Map<string, boolean>();

        const connectionComponents = owner.getComponentsByType(ClientConnectionComponent.name);
        if (connectionComponents.length === 0) {
            console.log('%s could not be initialized. %s component required.',
                PlayerInputController.name,
                ClientConnectionComponent.name
            );
            return;
        }
        // Assume one.
        this._connection = connectionComponents[0] as ClientConnectionComponent;

        
        var _this = this;
        this._connection.onMessage = function (message: any) {
            _this.filterMessage(message)
        }
    }

    get metaName(): string {
        return PlayerInputController.name;
    }


    isKeyPressed(keyCode: string): boolean {
        return this._keyStates.has(keyCode) && this._keyStates.get(keyCode)!;
    }

    preUpdate(): void {
        throw new Error("Method not implemented.");
    }

    onUpdate(): void {
        var enityTransforms = this.ownerEntity.getComponentsByType(TransformComponent.name);
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