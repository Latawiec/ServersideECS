import { RenderTarget } from "./RenderTarget";


/**
 * Buffer used for off-screen rendering.
 */
export class GBufferTarget implements RenderTarget {
    private gl: WebGLRenderingContext;

    private framebuffer: WebGLFramebuffer;
    // Expected to be read from
    private colorTexture: WebGLTexture;
    // Not expected to be read from
    private depthRenderbuffer: WebGLRenderbuffer;

    private width: number;
    private height: number;

    constructor(gl: WebGLRenderingContext, width: number, height: number) {
        this.gl = gl;
        this.width = width;
        this.height = height;

        this.colorTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)!;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.depthRenderbuffer = gl.createRenderbuffer()!;
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRenderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);

        this.framebuffer = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthRenderbuffer);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    get colorOutput(): Readonly<WebGLTexture> {
        return this.colorTexture;
    }

    bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.viewport(0, 0, this.width, this.height);
    }

}