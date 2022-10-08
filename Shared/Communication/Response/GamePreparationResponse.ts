import { ServerResponse, ServerResponseType } from "./ServerResponse";

export class GamePreparationResponse implements ServerResponse {
    type = ServerResponseType.GamePreparation;
    requiredAssetsPath: string | undefined;
}