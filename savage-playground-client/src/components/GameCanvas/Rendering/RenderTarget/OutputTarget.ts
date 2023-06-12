import { RenderTarget } from "./RenderTarget";


export class OutputTarget implements RenderTarget {
    private gl: WebGLRenderingContext;

    private width: number;
    private height: number;

    constructor(gl: WebGLRenderingContext, width: number, height: number) {
        this.gl = gl;

        this.width = width;
        this.height = height;
    }

    bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.width, this.height);
    }
}