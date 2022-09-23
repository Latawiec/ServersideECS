import { Entity } from "@core/Base/Entity"
import { DrawingSystem } from "@core/Systems/DrawingSystem";
import { SpriteSquareDrawable } from "../Basic/Drawing/SpriteSquareDrawable";
import { vec2 } from 'gl-matrix'

export enum CharacterType {
    RedMage
}

export class CharacterDrawable extends SpriteSquareDrawable {
    private static CharacterSpriteSize: vec2 = [2, 2];
    private static CharacterSpriteMap: Readonly<Map<CharacterType, string>> = new Map<CharacterType, string>([
        [CharacterType.RedMage, 'Common/WOL/RedMage.png']
    ]);

    constructor(owner: Entity, type: CharacterType) {
        super(owner, CharacterDrawable.CharacterSpriteMap.get(type)!, CharacterDrawable.CharacterSpriteSize);
    }

    serialize(): Record<string, any> {
        let result = super.serialize();

        // Sprite but with different mesh.
        result.assetPaths.mesh = 'Common/Meshes/squareVerticalBottomAligned.json'

        return result;
    }
}