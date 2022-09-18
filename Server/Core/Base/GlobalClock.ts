

export class GlobalClock {

    private _hasCurrentFrameTime = false;
    private _currentFrameTime = 0;
    private _startTime = 0;

    getTimeMs(): number {
        return Date.now() - this._startTime;
    }

    getCurrentFrameTimeMs(): number {
        if (!this._hasCurrentFrameTime) {
            this._currentFrameTime = this.getTimeMs() - this._startTime;
        }
        return this._currentFrameTime;
    }

    nextFrame() {
        this._hasCurrentFrameTime = false;
    }

    private static _instance: GlobalClock;

    static get clock() {
        if (!GlobalClock._instance) {
            GlobalClock._instance = new GlobalClock();
            GlobalClock._instance._startTime = GlobalClock._instance.getTimeMs()
        }
        return GlobalClock._instance;
    }
}