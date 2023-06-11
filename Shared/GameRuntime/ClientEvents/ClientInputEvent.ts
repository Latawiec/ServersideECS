import { ClientEvent, ClientEventType } from "./ClientEvent";

export class ClientInputEvent implements ClientEvent {
    type = ClientEventType.ClientInput;
}