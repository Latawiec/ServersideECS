import { ClientRequest, ClientRequestType } from "./ClientRequest";


export class CreateRoomRequest implements ClientRequest {
    type = ClientRequestType.CreateRoom;
}