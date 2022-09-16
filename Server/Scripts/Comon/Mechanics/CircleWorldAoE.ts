import { Entity } from "@core/Base/Entity"
import { DrawableAoECircleClosed } from "@core/Systems/DrawingSystem"
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TriggerCollisionSystem2D } from "@core/Systems/TriggerCollisionSystem2D";
import { runInThisContext } from "vm";

export class CircleWorldAoE extends ScriptSystem.Component {

    private _drawableComponent: DrawableAoECircleClosed;
    private _triggerComponent: TriggerCollisionSystem2D.CircleTriggerComponent;
    private _explosionTimeMs: number;
    private _isExploding = false;
    private _isExploded = false;

    private _explodedEntities = new Array<Entity>();

    constructor(ownerEntity: Entity, radius: number, explosionTimeMs: number) {
        super(ownerEntity);

        this._explosionTimeMs = explosionTimeMs;
        this._drawableComponent = new DrawableAoECircleClosed(this.ownerEntity, radius);
        this._triggerComponent = new TriggerCollisionSystem2D.CircleTriggerComponent(this.ownerEntity, radius);

        this._drawableComponent.transform.rotation = [Math.PI/2, 0, 0];
        this._drawableComponent.transform.scale = [radius, radius, radius];

        const self = this;
        this._triggerComponent.triggerListener = {
            onTriggered(triggededBy) {
                if ( self._isExploding ) {
                    self._explodedEntities.push(triggededBy.ownerEntity);
                }
            }
        }

        ownerEntity.getWorld().registerComponent(ownerEntity, this._drawableComponent);
        ownerEntity.getWorld().registerComponent(ownerEntity, this._triggerComponent);
        ownerEntity.getWorld().registerComponent(ownerEntity, this);
    }

    preUpdate(): void {
        
    }

    onUpdate(): void {
        if ( this._isExploding ) {
            console.log("Poof!");
            this.ownerEntity.getWorld().unregisterComponent(this._drawableComponent);
            this.ownerEntity.getWorld().unregisterComponent(this._triggerComponent);
            this.ownerEntity.getWorld().unregisterComponent(this);

            for (const exploded of this._explodedEntities) {
                console.log("Exploded: %s", exploded.getUuid());
            }

            this._isExploded = true;
        }
    }

    postUpdate(): void {
        const currentTimeMs = this.ownerEntity.getWorld().getClock().getTimeMs();
        if ( currentTimeMs >= this._explosionTimeMs ) {
            this._isExploding = true;
        }
    }

    get isExploded(): Readonly<boolean> {
        return this._isExploded;
    }
}