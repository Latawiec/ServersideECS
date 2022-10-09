import { World } from "@core/World/World";
import AssetConfig from "@config/assets.json"
import { Environment } from "./Environment/Environment";

export class AbyssosTheFifthCircleSavage extends World {
    private static WorldAssetsPath = 'Abyssos\\The Fifth Circle Savage.zip';

    private environment: Environment;

    constructor() {
        super(AbyssosTheFifthCircleSavage.WorldAssetsPath);

        this.environment = new Environment(this.createEntity());
    }

}