import { Camera } from "./Basic/Camera";
import { DrawTextureProgram } from "./Materials/DrawTextureProgram";
import { Shader, ShaderProgram, ShaderType } from "./Materials/ShaderProgram";
import { GBufferTarget } from "./RenderTarget/GBufferTarget";
import { OutputTarget } from "./RenderTarget/OutputTarget";

export enum Layer {
    Background, 
    Layer0,
    Layer1,
    Foreground
};

export interface DrawRequest {
    draw(camera: Readonly<Camera>): void;
};

export class Canvas {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private drawRequests: Map<Layer, DrawRequest[]>;

    private drawTextureProgram: DrawTextureProgram;
    private gBufferTarget: GBufferTarget;
    private outputTarget: OutputTarget;

    constructor (canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.drawRequests = new Map<Layer, DrawRequest[]>();
        this.gl = canvas.getContext('webgl', 
        {
            alpha: false
        })!;

        this.drawTextureProgram = new DrawTextureProgram(this.gl);
        this.gBufferTarget = new GBufferTarget(this.gl, canvas.width, canvas.height);
        this.outputTarget = new OutputTarget(this.gl, canvas.width, canvas.height);
    }

    executeDraw(camera: Readonly<Camera>): void {
        const gl = this.gl;

        this.gBufferTarget.bind();
        gl.clearColor(1.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.depthFunc(gl.LEQUAL);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (this.drawRequests.get(Layer.Background) !== undefined && this.drawRequests.get(Layer.Background)!.length !== 0) {
            this.drawRequests.get(Layer.Background)!.forEach(request => {
                request.draw(camera);
            })
        }

        if (this.drawRequests.get(Layer.Layer0) !== undefined && this.drawRequests.get(Layer.Layer0)!.length !== 0) {
            this.drawRequests.get(Layer.Layer0)!.forEach(request => {
                request.draw(camera);
            })
        }

        if (this.drawRequests.get(Layer.Layer1) !== undefined && this.drawRequests.get(Layer.Layer1) !.length !== 0) {
            this.drawRequests.get(Layer.Layer1)!.forEach(request => {
                request.draw(camera);
            })
        }

        if (this.drawRequests.get(Layer.Foreground) !== undefined && this.drawRequests.get(Layer.Foreground)!.length !== 0) {
            this.drawRequests.get(Layer.Foreground)!.forEach(request => {
                request.draw(camera);
            })
        }

        this.glContext.flush();
        this.drawRequests.clear();

        // Draw backbuffer to the canvas.
        this.outputTarget.bind();
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);

        this.drawTextureProgram.use();
        this.drawTextureProgram.draw(this.gBufferTarget.colorOutput);
    }

    requestDraw(layer: Layer, request: DrawRequest): void {
        if (!this.drawRequests.has(layer)) {
            this.drawRequests.set(layer, []);
        }

        this.drawRequests.get(layer)?.push(request);
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }

    get glContext() {
        return this.gl;
    }
}