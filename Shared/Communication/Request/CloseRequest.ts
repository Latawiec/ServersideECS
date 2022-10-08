import { ClientRequest, ClientRequestType } from "./ClientRequest";


export class CloseRequest implements ClientRequest {
    type = ClientRequestType.CloseConnection;
}