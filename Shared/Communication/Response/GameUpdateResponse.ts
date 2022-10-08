import { ServerResponse, ServerResponseType } from "./ServerResponse";
import { Serialization } from "../../WorldSnapshot"

export class GameUpdateResponse implements ServerResponse {
    type = ServerResponseType.GameUpdate;
    data: Serialization.WorldSnapshot | undefined;
}