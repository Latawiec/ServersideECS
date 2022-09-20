import { GlobalClock } from "@core/Base/GlobalClock";
import { World } from "@core/World/World";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { CircleWorldAoE } from "@scripts/Comon/Mechanics/CircleWorldAoE";
import { vec2, vec3 } from "gl-matrix";
import { Entity } from "@core/Base/Entity";
import { runInThisContext } from "vm";

export enum DevourPattern {
    Circle,
    ZigZag
};

export enum DevourPositions {
        NW, NE,
    WN,         EN,
    WS,         ES,
        SW, SE
};

export class Devour extends ScriptSystem.Component {

    // Timing
    private static _aoeDurationMs = 1000
    private static _aoeOffsetMs = 1500

    // AOE Description
    private static _aoeDistance = 5 // from middle
    private static _aoeRadius = 5
    private static _aoeIntensity = 1

    // Positions from middle.
    private static _devourPositions = new Map<Readonly<DevourPositions>, Readonly<vec2>>([
        [DevourPositions.NW, [-1.0, +2.0]],
        [DevourPositions.NE, [+1.0, +2.0]],
        [DevourPositions.WN, [-2.0, +1.0]],
        [DevourPositions.EN, [+2.0, +1.0]],
        [DevourPositions.WS, [-2.0, -1.0]],
        [DevourPositions.ES, [+2.0, -1.0]],
        [DevourPositions.SW, [-1.0, -2.0]],
        [DevourPositions.SE, [+1.0, -2.0]],
    ]);

    // Pattern position orders.
    // TODO: For now just single start point. Figure out how to make it independent of begin point.
    private static _patternPositions = new Map<Readonly<DevourPattern>, Readonly<Array<DevourPositions>>>([
        [DevourPattern.ZigZag, [
            DevourPositions.EN,
            DevourPositions.SE,
            DevourPositions.NE,
            DevourPositions.WN,
            DevourPositions.SW,
            DevourPositions.ES,
            DevourPositions.WS,
            DevourPositions.NW
        ]],

        [DevourPattern.Circle, [
            DevourPositions.EN,
            DevourPositions.SE,
            DevourPositions.WS,
            DevourPositions.NW,
            DevourPositions.SW,
            DevourPositions.ES,
            DevourPositions.NE,
            DevourPositions.WN
        ]]
    ]);


    // Instance data
    private _pattern: DevourPattern;
    private _startTime: number;
    private _isFinished: boolean = false;

    private _biteEntities = new Array<Entity>();

    constructor(ownerEntity: Entity, pattern: DevourPattern, startTime: number = GlobalClock.clock.getTimeMs()) {
        super(ownerEntity)
        this._pattern = pattern;
        this._startTime = startTime;

        this.ownerEntity.getTransform().rotation = vec3.fromValues(0, -Math.PI/4, 0);

        this.reset(this._startTime);
    }

    reset(startTime: number = GlobalClock.clock.getTimeMs()) {
        this._startTime = startTime;

        let biteCount = 0;
        for (const positionEnum of Devour._patternPositions.get(this._pattern)!) {
            const position = vec2.scale(vec2.create(), vec2.normalize(vec2.create(), Devour._devourPositions.get(positionEnum)!), Devour._aoeDistance);

            const world = this.ownerEntity.getWorld();
            const devourBiteEntity = world.createEntity(this.ownerEntity);

            devourBiteEntity.getTransform().position = vec3.fromValues(
                position[1],
                0.0,
                position[0],
            );

            const aoeCircleComponent = new CircleWorldAoE(devourBiteEntity, Devour._aoeRadius, Devour._aoeDurationMs, startTime + biteCount * Devour._aoeOffsetMs);
            aoeCircleComponent.intensity = 0.7;

            world.registerComponent(devourBiteEntity, aoeCircleComponent);

            this._biteEntities.push(devourBiteEntity);

            biteCount++;
        }
    }

    preUpdate(): void {

    }
    onUpdate(): void {

    }
    postUpdate(): void {
        if (this._isFinished) {
            return
        }

        for(const biteEntity of this._biteEntities) {
            const aoeComponent = biteEntity.getComponentsByType(CircleWorldAoE.staticMetaName())[0] as CircleWorldAoE;

            if (aoeComponent === undefined || !aoeComponent.isExploded) {
                return;
            }
        }

        this._isFinished = true;

        // TODO: Add proper failure/success handling... somewhere.
        const failedList = Array<Entity>();
        for(const biteEntity of this._biteEntities) {
            const aoeComponent = biteEntity.getComponentsByType(CircleWorldAoE.staticMetaName())[0] as CircleWorldAoE;

            for(const hit of aoeComponent.targetsHit) {
                const inListIndex = failedList.indexOf(hit);
                if (inListIndex > -1) {
                    continue;
                }

                failedList.push(hit);
            }
        }

        if (failedList.length === 0) {
            console.log("Everyone passed!");
        } else {
            console.log("Failed counter: %d", failedList.length);
        }

        // Clean up.
        for (const biteEntity of this._biteEntities) {
            const world = this.ownerEntity.getWorld();
            world.destroyEntity(biteEntity);
        }

    }

    get isFinished(): boolean {
        return this._isFinished;
    }

}