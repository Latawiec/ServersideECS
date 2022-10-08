export enum ServerResponseType {
    Unknown = 0,

    WorldUpdate,

}

export interface ServerResponse {
    type: ServerResponseType;
}