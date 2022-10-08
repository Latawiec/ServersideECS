import { ClientRequest, ClientRequestType } from "./ClientRequest";

export class LeaveRoomRequest implements ClientRequest {
    type = ClientRequestType.LeaveRoom;
}