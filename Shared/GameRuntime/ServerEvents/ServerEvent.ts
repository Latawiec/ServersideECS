export enum ServerEventType {
    Unknown = 0,

    GameConfig,
    GameUpdate,
}

export interface ServerEvent {
    type: ServerEventType;
}