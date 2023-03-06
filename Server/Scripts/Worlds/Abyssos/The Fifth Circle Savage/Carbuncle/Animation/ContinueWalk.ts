import { CarbuncleSprite } from "../CarbuncleDrawable";
import { Timeline, KeyFrame } from "@scripts/Comon/Basic/Animation/Animation";
import { CarbuncleAnimation } from "./CarbuncleAnimation";



export class ContinueWalk extends CarbuncleAnimation {

    private static Sprite = CarbuncleSprite.Walk;
    private static TimeStep = 250;
    private static Timeline = new Timeline<number>(
        [
            new KeyFrame(3, ContinueWalk.TimeStep),
            new KeyFrame(4, ContinueWalk.TimeStep),
            new KeyFrame(5, ContinueWalk.TimeStep),
            new KeyFrame(6, ContinueWalk.TimeStep),
            new KeyFrame(7, ContinueWalk.TimeStep),
            new KeyFrame(8, ContinueWalk.TimeStep),
            new KeyFrame(9, ContinueWalk.TimeStep),
            new KeyFrame(10, ContinueWalk.TimeStep),
        ]
    );
    private static TotalDuration = ContinueWalk.Timeline.totalDuration;
    private keyframe: KeyFrame<number> = ContinueWalk.Timeline.keyframes[0];

    get SpriteType(): CarbuncleSprite {
        return ContinueWalk.Sprite;
    }
    get SpriteProgress(): number {
        return this.keyframe.value;
    }

    IsDone(): boolean {
        return this.timeElapsed >= ContinueWalk.TotalDuration;
    }

    Update(dt: number): void {
        var keyframeOffset = Math.min(Math.floor(this.timeElapsed / ContinueWalk.TimeStep), ContinueWalk.Timeline.keyframes.length - 1);
        this.keyframe = ContinueWalk.Timeline.keyframes[keyframeOffset];
    }
}