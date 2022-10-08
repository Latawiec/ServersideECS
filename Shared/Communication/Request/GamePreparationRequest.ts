import { ClientRequest, ClientRequestType } from "./ClientRequest";

export class GamePreparationRequest implements ClientRequest {
    type = ClientRequestType.GamePreparation;
    assetsReady = false;
}