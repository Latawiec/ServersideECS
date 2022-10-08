import { CloseRequest } from "./CloseRequest";
import { CreateRoomRequest } from "./CreateRoomRequest";
import { GameInputRequest } from "./GameInputRequest";
import { JoinRoomRequest } from "./JoinRoomRequest";
import { LeaveRoomRequest } from "./LeaveRoomRequest";

export enum ClientRequestType {
    Unknown = 0,
    GameConfig,
    GameInput,
    GameStart,
    JoinRoom,
    LeaveRoom,
    CreateRoom,
}

export class ClientRequest {
    type: ClientRequestType = ClientRequestType.Unknown;
    request: CreateRoomRequest | CloseRequest | GameInputRequest | JoinRoomRequest | LeaveRoomRequest | undefined;
}