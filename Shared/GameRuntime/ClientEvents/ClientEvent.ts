export enum ClientEventType {
    Unknown = 0,

    ClientInput,
}

export interface ClientEvent {
    type: ClientEventType;
}