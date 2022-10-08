import { World } from "@core/World/World";
import Config from "@config/assets.json"
import { Environment } from "./Environment/Environment";

export class AbyssosTheFifthCircleSavage extends World {
    private static WorldAssetsPath = Config.assetsRootDir + "\\Worlds\\Abyssos\\The Fifth Circle Savage"

    private environment: Environment;

    constructor() {
        super(AbyssosTheFifthCircleSavage.WorldAssetsPath);

        this.environment = new Environment(this.createEntity());
    }

}