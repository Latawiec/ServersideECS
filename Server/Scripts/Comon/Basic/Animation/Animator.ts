import { BaseAnimation } from "@scripts/Comon/Basic/Animation/Animation";


export class Animator<TAnimation extends BaseAnimation> {

    private currentAnimation: TAnimation | undefined;
    private queue: Array<TAnimation> = new Array<TAnimation>();
    private pauseLeft: number = 0;

    Next(animation: TAnimation): this {
        this.queue.push(animation);
        return this;
    }

    // Pauses indefinately if none provided.
    Pause(duration: number = Number.MAX_SAFE_INTEGER): this {
        this.pauseLeft = duration;
        return this;
    }

    Play(): this {
        this.pauseLeft = 0;
        return this;
    }

    Reset(): this {
        this.queue.splice(0);
        return this;
    }

    Update(dt: number): void {
        this.pauseLeft -= dt;
        if (this.pauseLeft > 0) {
            return;
        }
        this.pauseLeft = 0;

        if (this.currentAnimation === undefined || this.currentAnimation.IsDone()) {
            this.currentAnimation = this.queue.shift();
        }

        this.currentAnimation?.Play(dt);
    }

    IsDone() {
        return this.currentAnimation === undefined && this.queue.length === 0;
    }

    get CurrentAnimation(): Readonly<TAnimation> | undefined { 
        return this.currentAnimation;
    }
}