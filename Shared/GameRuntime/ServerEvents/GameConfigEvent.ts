import { ServerEvent, ServerEventType } from "./ServerEvent";

export class GameConfigEvent implements ServerEvent {
    type = ServerEventType.GameConfig;
}