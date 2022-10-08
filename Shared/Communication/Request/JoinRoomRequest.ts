import { ClientRequest, ClientRequestType } from "./ClientRequest";

export class JoinRoomRequest implements ClientRequest {
    type = ClientRequestType.JoinRoom;
    roomId: number = 0;
}