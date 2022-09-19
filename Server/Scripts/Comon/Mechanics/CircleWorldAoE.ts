import { Entity } from "@core/Base/Entity"
import { CircleWorldAoEDrawableComponent } from "./CircleWorldAoEDrawableComponent"
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TriggerCollisionSystem2D } from "@core/Systems/TriggerCollisionSystem2D";
import { runInThisContext } from "vm";
import { GlobalClock } from "@core/Base/GlobalClock";

export class CircleWorldAoE extends ScriptSystem.Component {

    private _drawableComponent: CircleWorldAoEDrawableComponent;
    private _triggerComponent: TriggerCollisionSystem2D.CircleTriggerComponent;
    private _explosionTimeMs: number;
    private _isExploding = false;
    private _isExploded = false;

    private _startTimeMs: number;
    private _fadeInMs = 250;
    private _fadeOutMs = 500;

    private _radius = 1.0;
    private _intensity = 0.9;

    private _explodedEntities = new Array<Entity>();

    constructor(ownerEntity: Entity, radius: number, duration: number) {
        super(ownerEntity);
        this._startTimeMs = GlobalClock.clock.getTimeMs();
        this._explosionTimeMs = this._startTimeMs + duration;
        this._drawableComponent = new CircleWorldAoEDrawableComponent(this.ownerEntity, radius);
        this._triggerComponent = new TriggerCollisionSystem2D.CircleTriggerComponent(this.ownerEntity, radius);

        this._radius = radius;
        this._drawableComponent.radius = radius;
        this._drawableComponent.intensity = this._intensity;

        this._drawableComponent.transform.rotation = [Math.PI/2, 0, 0];

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
        const time = GlobalClock.clock.getTimeMs();
        const fadeInProgress = Math.min(1, Math.max(0, (time - this._startTimeMs) / this._fadeInMs));
        const fadeOutProgress = Math.min(1, Math.max(0, (this._explosionTimeMs - time) / this._fadeOutMs));

        this._drawableComponent.radius = 0.2 * this._radius + 0.8 * fadeInProgress * fadeInProgress * this._radius;
        this._drawableComponent.opacity = fadeInProgress * fadeOutProgress;

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
        const currentTimeMs = GlobalClock.clock.getTimeMs();
        if ( currentTimeMs >= this._explosionTimeMs ) {
            this._isExploding = true;
        }
    }

    get isExploded(): Readonly<boolean> {
        return this._isExploded;
    }
}