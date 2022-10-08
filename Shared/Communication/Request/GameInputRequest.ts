import { ClientRequest, ClientRequestType } from "./ClientRequest";

export class GameInputRequest implements ClientRequest {
    type = ClientRequestType.GameInput;
    // TODO: could be key-codes instead.
    keyPressed: string | undefined;
    keyReleased: string | undefined;
}