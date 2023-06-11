import { ServerEvent, ServerEventType } from "./ServerEvent";
import { Serialization } from "../../WorldSnapshot"

export class GameUpdateEvent implements ServerEvent {
    type = ServerEventType.GameUpdate;
    snapshot: Serialization.WorldSnapshot
}