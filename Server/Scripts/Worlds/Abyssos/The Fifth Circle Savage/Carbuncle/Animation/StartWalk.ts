import { CarbuncleSprite } from "../CarbuncleDrawable";
import { Timeline, KeyFrame } from "@scripts/Comon/Basic/Animation/Animation";
import { CarbuncleAnimation } from "./CarbuncleAnimation";



export class StartWalk extends CarbuncleAnimation {

    private static Sprite = CarbuncleSprite.Walk;
    private static TimeStep = 250;
    private static Timeline = new Timeline<number>(
        [
            new KeyFrame(0, StartWalk.TimeStep),
            new KeyFrame(1, StartWalk.TimeStep),
            new KeyFrame(2, StartWalk.TimeStep),
        ]
    );
    private static TotalDuration = StartWalk.Timeline.totalDuration;
    private keyframe: KeyFrame<number> = StartWalk.Timeline.keyframes[0];

    get SpriteType(): CarbuncleSprite {
        return StartWalk.Sprite;
    }
    get SpriteProgress(): number {
        return this.keyframe.value;
    }

    IsDone(): boolean {
        return this.timeElapsed >= StartWalk.TotalDuration;
    }

    Update(dt: number): void {
        var keyframeOffset = Math.min(Math.floor(this.timeElapsed / StartWalk.TimeStep), StartWalk.Timeline.keyframes.length - 1);
        this.keyframe = StartWalk.Timeline.keyframes[keyframeOffset];
    }
}