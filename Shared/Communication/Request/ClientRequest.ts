export enum ClientRequestType {
    Unknown = 0,

    GameConfig,
    GameInput,
    GamePreparation,
    GameStart,

    JoinRoom,
    LeaveRoom,
    CreateRoom,

    CloseConnection,
}

export interface ClientRequest {
    type: ClientRequestType;
}