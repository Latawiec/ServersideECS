import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TextureSquareDrawable } from "@scripts/Comon/Basic/Drawing/TextureSquareDrawable";
import { vec3 } from "gl-matrix";
import { DrawingLayers } from "./DrawingLayers";

enum RockSize {
    XS, S, M, L, XL
}

class Rock extends ScriptSystem.Component {
    private static RockAssetPaths = new Map<RockSize, string>([
        [RockSize.XS, "Rock XS.png"],
        [RockSize.S,  "Rock S.png"],
        [RockSize.M,  "Rock M.png"],
        [RockSize.L,  "Rock L.png"],
        [RockSize.XL, "Rock XL.png"]
    ]);

    private static RockSizes = new Map<RockSize, vec3>([
        [RockSize.XS, [22, 0, 24]],
        [RockSize.S,  [34, 0, 29]],
        [RockSize.M,  [41, 0, 36]],
        [RockSize.L,  [70, 0, 51]],
        [RockSize.XL, [85, 0, 54]]
    ]);

    private static Layer = DrawingLayers.PoolDebris;

    private drawable: TextureSquareDrawable;
    private translation: vec3;

    constructor(parent: Entity, size: RockSize, position: vec3, environmentScale: vec3, flipped = false) {
        const entity = parent.world.createEntity();
        super(entity);

        this.translation = position;
        this.drawable = new TextureSquareDrawable(entity, Rock.RockAssetPaths.get(size)!);
        this.drawable.transform.scale(Rock.RockSizes.get(size)!).scale(environmentScale);
        if (flipped) {
            this.drawable.transform.scale([-1, 1, 1]);
        }
        this.drawable.layer = Rock.Layer;
        this.drawable.billboard = true;

        entity.transform.move(this.translation);

        this.isActive = false;
    }

    preUpdate(): void {    
    }

    onUpdate(): void {
    }

    postUpdate(): void {
    }
}

interface RockDesc {
    size: RockSize;
    position: vec3;
    flipped: boolean;
};

export class Debris extends ScriptSystem.Component {
    private static RockDescriptions = Array<RockDesc>(
        { size: RockSize.XS, position: [ 8, 0, 17], flipped: false },
        { size: RockSize.XS, position: [ -10, 0, -15], flipped: false },
        { size: RockSize.XS, position: [ -27, 0, -14.5], flipped: false },
        { size: RockSize.XS, position: [  9, 0, -18], flipped: true },
        { size: RockSize.XS, position: [ -11, 0, 28], flipped: true },
        { size: RockSize.XS, position: [ -19, 0, 6.5], flipped: true },

        // { size: RockSize.S, position: [ 20, 0,   3], flipped: false },
        // { size: RockSize.S, position: [-6.5, 0,-11], flipped: true },
        // { size: RockSize.S, position: [ 10, 0,  13], flipped: true },
        // { size: RockSize.S, position: [ 13.5, 0,  -6.3], flipped: true },
        // { size: RockSize.S, position: [ -9.5, 0,  9.5], flipped: true },

        // { size: RockSize.M, position: [8.5, 0,  6], flipped: false },
        // { size: RockSize.M, position: [-9, 0, 12], flipped: false },
        // { size: RockSize.M, position: [-16, 0, 0], flipped: false },

        // { size: RockSize.L, position: [-5.6, 0, 3.8], flipped: false },
        // { size: RockSize.L, position: [ 4.5, 0, 9.2], flipped: true },
    )

    private rocks = new Array<Rock>();

    constructor(parent: Entity, environmentScale: Float32Array) {
        const entity = parent.world.createEntity();
        super(entity);

        for(const rockDesc of Debris.RockDescriptions) {
            const size = rockDesc.size;
            const position = rockDesc.position;
            const flipped = rockDesc.flipped;

            this.rocks.push(new Rock(entity, size, position, environmentScale, flipped));
        }

        this.isActive = false;
    }

    preUpdate(): void {    
    }

    onUpdate(): void {
    }

    postUpdate(): void {
    }
}

