import { ClientRequest, ClientRequestType } from "./ClientRequest";

export class GameStartRequest implements ClientRequest {
    type = ClientRequestType.GameStart;
}