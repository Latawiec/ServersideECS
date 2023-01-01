import { Camera } from "./Basic/Camera";
import { DrawTextureProgram } from "./Materials/DrawTextureProgram";
import { Shader, ShaderProgram, ShaderType } from "./Materials/ShaderProgram";
import { GBufferTarget } from "./RenderTarget/GBufferTarget";
import { OutputTarget } from "./RenderTarget/OutputTarget";

export interface DrawRequest {
    draw(camera: Readonly<Camera>): void;
    zorder: number;
};

export class Canvas {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private drawRequests: Array<DrawRequest>;

    private drawTextureProgram: DrawTextureProgram;
    private gBufferTarget: GBufferTarget;
    private outputTarget: OutputTarget;

    constructor (canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.drawRequests = new Array();
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
        gl.clearColor(49/256.0, 85/256, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        // gl.depthFunc(gl.LEQUAL);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let lastLayer = 0;
        this.drawRequests.forEach(request => {
            if (request.zorder != lastLayer) {
                lastLayer = request.zorder;
                this.glContext.flush();
            }
            request.draw(camera);
        });

        this.glContext.flush();
        this.drawRequests.splice(0);

        // Draw backbuffer to the canvas.
        this.outputTarget.bind();
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);

        this.drawTextureProgram.use();
        this.drawTextureProgram.draw(this.gBufferTarget.colorOutput);
    }

    requestDraw(request: DrawRequest): void {
        this.drawRequests.push(request);
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