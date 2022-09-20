import { Entity } from "@core/Base/Entity"
import { CircleWorldAoEDrawableComponent } from "./CircleWorldAoEDrawableComponent"
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { TriggerCollisionSystem2D } from "@core/Systems/TriggerCollisionSystem2D";
import { runInThisContext } from "vm";
import { GlobalClock } from "@core/Base/GlobalClock";

export class CircleWorldAoE extends ScriptSystem.Component {
    // Metadata 
    static staticMetaName(): string { return 'Common.Mechanics.CircleWorldAoE' }

    get metaName(): string {
        return CircleWorldAoE.staticMetaName();
    }

    private _drawableComponent: CircleWorldAoEDrawableComponent;
    private _triggerComponent: TriggerCollisionSystem2D.CircleTriggerComponent;
    private _explosionTimeMs: number;
    private _isExploding = false;
    private _isExploded = false;

    private _startTimeMs: number;
    private _fadeInMs = 250;
    private _fadeOutMs = 300;

    public radius = 1.0;
    public intensity = 0.5;

    private _explodedEntities = new Array<Entity>();

    constructor(ownerEntity: Entity, radius: number, duration: number, startTime: number = GlobalClock.clock.getTimeMs()) {
        super(ownerEntity);
        this._startTimeMs = startTime;
        this._explosionTimeMs = this._startTimeMs + duration;
        this._drawableComponent = new CircleWorldAoEDrawableComponent(this.ownerEntity, radius);
        this._triggerComponent = new TriggerCollisionSystem2D.CircleTriggerComponent(this.ownerEntity, radius);

        this.radius = radius;
        this._drawableComponent.radius = radius;
        this._drawableComponent.intensity = this.intensity;

        // TODO: Change mesh coords. Do not rotate every time I use it...
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
        if (this._isExploded) {
            return;
        }

        const currentTimeMs = GlobalClock.clock.getTimeMs();
        if ( currentTimeMs >= this._explosionTimeMs ) {
            this._isExploding = true;
        }
    }

    onUpdate(): void {
        if (this._isExploded) {
            // I shouldn't have to do this... we're unregistering this below.
            return;
        }

        const time = GlobalClock.clock.getTimeMs();
        const fadeInProgress = Math.min(1, Math.max(0, (time - this._startTimeMs) / this._fadeInMs));
        const fadeOutProgress = Math.min(1, Math.max(0, (this._explosionTimeMs - time) / this._fadeOutMs));


        if (time < this._startTimeMs || time > this._explosionTimeMs) {
            this._triggerComponent.isActive = false;
        } else {
            this._triggerComponent.isActive = true;
        }
        
        this._drawableComponent.radius = 0.2 * this.radius + 0.8 * fadeInProgress * fadeInProgress * this.radius;
        this._drawableComponent.opacity = fadeInProgress * fadeOutProgress;

        if ( this._isExploding ) {
            console.log("Poof!");
            
            for (const exploded of this._explodedEntities) {
                console.log("Exploded: %s", exploded.getUuid());
            }

            this.ownerEntity.getWorld().unregisterComponent(this._drawableComponent);
            this.ownerEntity.getWorld().unregisterComponent(this._triggerComponent);
            this.ownerEntity.getWorld().unregisterComponent(this);

            this._isExploded = true;
        }
    }

    postUpdate(): void {
    }

    get isExploded(): Readonly<boolean> {
        return this._isExploded;
    }

    get targetsHit(): Readonly<Array<Entity>> {
        return this._explodedEntities;
    }
}