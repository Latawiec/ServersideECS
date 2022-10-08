import { ClientRequest, ClientRequestType } from "./ClientRequest";

export class GameInputRequest implements ClientRequest {
    type = ClientRequestType.GameInput;
    // TODO: could be key-codes instead.
    // TODO: this makes it impossible to handle multiple key presses ??? Possibly.
    keyPressed: string | undefined;
    keyReleased: string | undefined;
}