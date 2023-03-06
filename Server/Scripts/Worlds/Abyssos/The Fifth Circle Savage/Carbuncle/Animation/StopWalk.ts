import { CarbuncleSprite } from "../CarbuncleDrawable";
import { Timeline, KeyFrame } from "@scripts/Comon/Basic/Animation/Animation";
import { CarbuncleAnimation } from "./CarbuncleAnimation";



export class StopWalk extends CarbuncleAnimation {

    private static Sprite = CarbuncleSprite.Walk;
    private static TimeStep = 250;
    private static Timeline = new Timeline<number>(
        [
            new KeyFrame(1, StopWalk.TimeStep),
            new KeyFrame(0, StopWalk.TimeStep),
        ]
    );
    private static TotalDuration = StopWalk.Timeline.totalDuration;
    private keyframe: KeyFrame<number> = StopWalk.Timeline.keyframes[0];

    get SpriteType(): CarbuncleSprite {
        return StopWalk.Sprite;
    }
    get SpriteProgress(): number {
        return this.keyframe.value;
    }

    IsDone(): boolean {
        return this.timeElapsed >= StopWalk.TotalDuration;
    }

    Update(dt: number): void {
        var keyframeOffset = Math.min(Math.floor(this.timeElapsed / StopWalk.TimeStep), StopWalk.Timeline.keyframes.length - 1);
        this.keyframe = StopWalk.Timeline.keyframes[keyframeOffset];
    }
}