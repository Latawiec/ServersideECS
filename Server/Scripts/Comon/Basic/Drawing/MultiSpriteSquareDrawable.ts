import { Entity } from "@core/Base/Entity";
import { DrawingSystem } from "@core/Systems/DrawingSystem";
import { vec2 } from "gl-matrix";
import { Serialization } from "@shared/WorldSnapshot";
import { SpriteSquareDrawable } from "./SpriteSquareDrawable";

export class SpriteDescription
{
    texturePath: string = "";
    elementsCount: vec2 = [0, 0];

    constructor(texturePath: string, elementsCount: vec2) {
        this.texturePath = texturePath;
        this.elementsCount = elementsCount;
    }
};

export class MultiSpriteSquareDrawable extends SpriteSquareDrawable {

    private _sprites: Array<SpriteDescription>;
    private _selectedSprite: number = 0;


    constructor(owner: Entity, spriteDescs: Array<SpriteDescription>) {
        super(owner);
        this._sprites = spriteDescs;
        this.spriteSelection = 0;
    }

    set spriteSelection(value: number) {
        this._selectedSprite = value;
        this.texturePath = this._sprites[value].texturePath;
        this.spriteSize = this._sprites[value].elementsCount;
    }

    get spriteSelection(): Readonly<number> {
        return this._selectedSprite;
    }
}