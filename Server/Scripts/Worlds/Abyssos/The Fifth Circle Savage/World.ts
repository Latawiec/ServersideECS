import { World } from "@core/World/World";
import AssetConfig from "@config/assets.json"
import { Environment } from "./Environment/Environment";
import { CarbuncleDrawable } from "./Carbuncle/CarbuncleDrawable";
import { Animator } from "@scripts/Comon/Basic/Animation/Animator";
import { CarbuncleAnimation } from "./Carbuncle/Animation/CarbuncleAnimation";
import { Entity } from "@core/Base/Entity";
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { GlobalClock } from "@core/Base/GlobalClock";
import { StartWalk } from "./Carbuncle/Animation/StartWalk";
import { ContinueWalk } from "./Carbuncle/Animation/ContinueWalk";
import { StopWalk } from "./Carbuncle/Animation/StopWalk";
import { PauseAnimation } from "@scripts/Comon/Basic/Animation/Pause";


// Test Animator
class CarbuncleDrawableAnimator extends ScriptSystem.Component {
    private animator: Animator<CarbuncleAnimation>
    private drawable: CarbuncleDrawable;
    private lastTime: number;

    constructor(owner: Entity, drawable: CarbuncleDrawable) {
        super(owner);
        this.drawable = drawable;
        this.animator = new Animator<CarbuncleAnimation>();
        this.lastTime = GlobalClock.clock.getTimeMs();

        this.animator.Pause(5000)
                     .Next(new StartWalk())
                     .Next(new ContinueWalk())
                     .Next(new ContinueWalk())
                     .Next(new StopWalk());
    }

    preUpdate(): void {
        // throw new Error("Method not implemented.");
    }
    onUpdate(): void {
        const currentTime = GlobalClock.clock.getTimeMs()
        this.animator.Update(currentTime - this.lastTime);
        
        if (this.animator.CurrentAnimation) {
            this.drawable.progress = this.animator.CurrentAnimation.SpriteProgress;
            this.drawable.sprite = this.animator.CurrentAnimation.SpriteType;
        }

        this.lastTime = currentTime;
    }
    postUpdate(): void {
        // throw new Error("Method not implemented.");
    }
}

export class AbyssosTheFifthCircleSavage extends World {
    private static WorldAssetsPath = 'Abyssos\\The Fifth Circle Savage.zip';

    private environment: Environment;

    private test: CarbuncleDrawable;

    constructor() {
        super(AbyssosTheFifthCircleSavage.WorldAssetsPath);

        this.environment = new Environment(this.createEntity());
        this.test = new CarbuncleDrawable(this.createEntity(), Environment.PixelsToYalmsScale);
        const testAnimator = new CarbuncleDrawableAnimator(this.createEntity(), this.test);
    }

}