

export class KeyFrame<T> {
    value: T;
    duration: number;

    constructor(value: T, duration: number) {
        this.value = value;
        this.duration = duration;
    }
}

export class Timeline<T> {
    keyframes: Array<KeyFrame<T>>;
    totalDuration: number;

    constructor(keyframes: Array<KeyFrame<T>>) {
        this.keyframes = keyframes;
        this.totalDuration = 0;
        keyframes.forEach(keyframe => {
            this.totalDuration += keyframe.duration;
        });
    }
}

export abstract class BaseAnimation {
    protected timeElapsed = 0;

    Reset() {
        this.timeElapsed = 0;
    }

    Play(dt: number) {
        this.timeElapsed += dt;
        this.Update(dt);
    }

    
    abstract IsDone(): boolean;
    protected abstract Update(dt: number): void;
}