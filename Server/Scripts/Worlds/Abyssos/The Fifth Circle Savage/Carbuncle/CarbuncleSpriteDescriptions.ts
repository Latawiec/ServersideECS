import { SpriteDescription } from "@scripts/Comon/Basic/Drawing/MultiSpriteSquareDrawable";
import { vec2 } from "gl-matrix";


export class IdleSpriteDescription extends SpriteDescription {
    private static TexturePath: string = "Sprites/Carbuncle/Walk.png";
    private static ElementsCount: vec2 = [12, 8]; 

    constructor() {
        super(IdleSpriteDescription.TexturePath, IdleSpriteDescription.ElementsCount);
    }
}

export class WalkSpriteDescription extends SpriteDescription {
    private static TexturePath: string = "Sprites/Carbuncle/Walk.png";
    private static ElementsCount: vec2 = [12, 8]; 

    constructor() {
        super(WalkSpriteDescription.TexturePath, WalkSpriteDescription.ElementsCount);
    }
}