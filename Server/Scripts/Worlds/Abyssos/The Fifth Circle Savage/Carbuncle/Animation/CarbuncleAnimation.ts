import { CarbuncleSprite } from "../CarbuncleDrawable";
import { BaseAnimation } from "@scripts/Comon/Basic/Animation/Animation";


export abstract class CarbuncleAnimation extends BaseAnimation {
    abstract get SpriteType(): CarbuncleSprite;
    abstract get SpriteProgress(): number;
}