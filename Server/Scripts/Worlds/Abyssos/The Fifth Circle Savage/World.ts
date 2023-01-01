import { World } from "@core/World/World";
import AssetConfig from "@config/assets.json"
import { Environment } from "./Environment/Environment";
import { CarbuncleDrawable } from "./Carbuncle/CarbuncleDrawable";

export class AbyssosTheFifthCircleSavage extends World {
    private static WorldAssetsPath = 'Abyssos\\The Fifth Circle Savage.zip';

    private environment: Environment;

    private test: CarbuncleDrawable;

    constructor() {
        super(AbyssosTheFifthCircleSavage.WorldAssetsPath);

        this.environment = new Environment(this.createEntity());
        this.test = new CarbuncleDrawable(this.createEntity(), Environment.PixelsToYalmsScale);
    }

}