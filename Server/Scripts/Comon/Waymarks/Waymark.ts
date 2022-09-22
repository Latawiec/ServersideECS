import { Entity } from "@core/Base/Entity"
import { WaymarkBaseDrawable } from "./WaymarkBaseDrawable"
import { ScriptSystem } from "@core/Systems/ScriptSystem"
import { vec3 } from "gl-matrix"

export enum WaymarkType {
    _A, _B, _C, _D,
    _1, _2, _3, _4
};

export class Waymark extends ScriptSystem.Component {
    // Metadata
    static staticMetaName(): string { return 'Common.Waymarks.Waymark' }

    get metaName(): string {
        return Waymark.staticMetaName();
    }

    private static _waymarkColors = new Map<WaymarkType, vec3>([
        [WaymarkType._A, [1.00, 0.29, 0.37]], [WaymarkType._1, [1.00, 0.29, 0.37]],
        [WaymarkType._B, [1.00, 0.85, 0.39]], [WaymarkType._2, [1.00, 0.85, 0.39]],
        [WaymarkType._C, [0.45, 0.74, 1.00]], [WaymarkType._3, [0.45, 0.74, 1.00]],
        [WaymarkType._D, [0.71, 0.25, 0.97]], [WaymarkType._4, [0.71, 0.25, 0.97]],
    ]);

    private _type: WaymarkType;
    private _baseDrawable: WaymarkBaseDrawable;

    constructor(entity: Entity, type: WaymarkType) {
        super(entity);
        this._type = type;

        this._baseDrawable = new WaymarkBaseDrawable(entity);
        this._baseDrawable.color = Waymark._waymarkColors.get(this._type)!;
        this._baseDrawable.transform.scale([1.16, 1.16, 1.16]);
        entity.world.registerComponent(entity, this._baseDrawable);
        entity.world.registerComponent(entity, this);
    }

    get type(): Readonly<WaymarkType> {
        return this._type;
    }

    set type(newType: Readonly<WaymarkType>) {
        this._type = newType;
        this._baseDrawable.color = Waymark._waymarkColors.get(this._type)!;
    }

    preUpdate(): void {
        
    }
    onUpdate(): void {
        
    }
    postUpdate(): void {
        
    }
}