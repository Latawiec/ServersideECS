import { BaseAnimation } from "./Animation";


export class PauseAnimation extends BaseAnimation {
    private _pauseDuration: number;

    constructor(pauseDuration: number) {
        super()
        this._pauseDuration = pauseDuration;
    }

    IsDone(): boolean {
        return this.timeElapsed >= this._pauseDuration;
    }
    protected Update(dt: number): void {
        // NOP
    }
}