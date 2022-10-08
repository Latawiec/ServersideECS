export enum ServerResponseType {
    Unknown = 0,

    GamePreparation,
    GameUpdate,

}

export interface ServerResponse {
    type: ServerResponseType;
}