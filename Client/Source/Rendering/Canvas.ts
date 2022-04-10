
export enum Layer {
    Background, 
    Layer0,
    Layer1,
    Foreground
};

export interface DrawRequest {
    draw(): void;
};

export class Canvas {
    private _canvas: HTMLCanvasElement;
    private _gl: WebGLRenderingContext;
    private _drawRequests: Map<Layer, DrawRequest[]>;
    
    constructor (canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        this._drawRequests = new Map<Layer, DrawRequest[]>();
        this._gl = canvas.getContext('webgl')!;
    }

    executeDraw(): void {
        this._gl.clearColor(0.0, 1.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.depthFunc(this._gl.LEQUAL);

        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        if (this._drawRequests.get(Layer.Background) !== undefined && this._drawRequests.get(Layer.Background)!.length !== 0) {
            this._drawRequests.get(Layer.Background)!.forEach(request => {
                request.draw();
            })
        }

        if (this._drawRequests.get(Layer.Layer0) !== undefined && this._drawRequests.get(Layer.Layer0)!.length !== 0) {
            this._drawRequests.get(Layer.Layer0)!.forEach(request => {
                request.draw();
            })
        }

        if (this._drawRequests.get(Layer.Layer1) !== undefined && this._drawRequests.get(Layer.Layer1) !.length !== 0) {
            this._drawRequests.get(Layer.Layer1)!.forEach(request => {
                request.draw();
            })
        }

        if (this._drawRequests.get(Layer.Foreground) !== undefined && this._drawRequests.get(Layer.Foreground)!.length !== 0) {
            this._drawRequests.get(Layer.Foreground)!.forEach(request => {
                request.draw();
            })
        }

        this._drawRequests.clear();
    }

    requestDraw(layer: Layer, request: DrawRequest): void {
        if (!this._drawRequests.has(layer)) {
            this._drawRequests.set(layer, []);
        }

        this._drawRequests.get(layer)?.push(request);
    }

    get width() {
        return this._canvas.width;
    }

    get height() {
        return this._canvas.height;
    }

    get glContext() {
        return this._gl;
    }
}