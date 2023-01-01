import { Entity } from "@core/Base/Entity"
import { MultiSpriteSquareDrawable, SpriteDescription } from "@scripts/Comon/Basic/Drawing/MultiSpriteSquareDrawable";
import { Serialization } from "@shared/WorldSnapshot";
import { vec2, vec3 } from "gl-matrix";
import { DrawingLayers } from "../Environment/DrawingLayers";
import { IdleSpriteDescription, WalkSpriteDescription } from "./CarbuncleSpriteDescriptions";


enum Direction {
    UpLeft, Up,         UpRight,
    Left,   /*Center,*/ Right,
    DownLeft, Down,     DownRight
}

enum Sprite {
    Idle = 0,
    Walk = 1,
    Dash = 2,
    Jump = 3,
    Gnaw = 4,
    Tail = 5,
    Spit = 6,
    Claw = 7
}


export class CarbuncleDrawable extends MultiSpriteSquareDrawable {
    private static TextureSize: vec3 = [384, 0, 384];
    private static TextureOffset: vec3 = [0, 0, 10];
    private static DirectionsMap = new Map<Readonly<Direction>, Readonly<number>>([
        [Direction.Down, 0],
        [Direction.DownLeft, 1],
        [Direction.DownRight, 2],
        [Direction.Left, 3],
        [Direction.Right, 4],
        [Direction.Up, 5],
        [Direction.UpLeft, 6],
        [Direction.UpRight, 7]
    ]);

    private static SpriteDescriptionsArray = new Array<SpriteDescription> (
        new IdleSpriteDescription(),
        new WalkSpriteDescription()
    )

    private _direction: Direction = Direction.Down;

    constructor(owner: Entity, environmentScale: vec3) {
        super(owner, CarbuncleDrawable.SpriteDescriptionsArray);
        this.transform.move(CarbuncleDrawable.TextureOffset);
        this.transform.scale(CarbuncleDrawable.TextureSize).scale(environmentScale);
        this.layer = DrawingLayers.Carbuncle;
        this.billboard = true;
    }

    takeSnapshot(): Serialization.Drawable.Snapshot {
        const result = super.takeSnapshot();

        // Sprite but with different mesh.
        result.assets.mesh = 'Common/Meshes/squareCentered.json';

        return result;
    }

    set direction(value: Direction) {
        this._direction = value;
        this.selection = [this.selection[0], CarbuncleDrawable.DirectionsMap.get(value)!];
    }

    get direction(): Direction {
        return this._direction;
    }

    set sprite(value: Sprite) {
        this.spriteSelection = value;
    }

    get sprite(): Readonly<Sprite> {
        return this.spriteSelection;
    }
}