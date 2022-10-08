import { ServerResponse, ServerResponseType } from "./ServerResponse";
import { Serialization } from "../../WorldSnapshot"

export class WorldUpdateResponse implements ServerResponse {
    type = ServerResponseType.WorldUpdate;
    data: Serialization.WorldSnapshot | undefined;
}