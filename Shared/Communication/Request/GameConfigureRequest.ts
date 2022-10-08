import { ClientRequest, ClientRequestType } from "./ClientRequest";

export class GameConfigureRequest implements ClientRequest {
    type = ClientRequestType.GameConfig;
    
}