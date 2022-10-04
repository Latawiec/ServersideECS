import { Camera } from "./Basic/Camera";
import { Shader, ShaderProgram, ShaderType } from "./Materials/ShaderProgram";

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
    private _canvas: HTMLCanvasElement;
    private _gl: WebGLRenderingContext;
    private _drawRequests: Map<Layer, DrawRequest[]>;
    private _frameBuffer: WebGLFramebuffer;
    private _bufferTexture: WebGLTexture;
    private _depthBuffer: WebGLRenderbuffer;
    
    private _renderWidthPixels = 1080;
    private _renderHeightPixels = 1080;

    private _screenRectangleVertices: Float32Array = Float32Array.from([
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0 
    ])

    private _screenRectangleIndices: Uint16Array = Uint16Array.from([
        0, 1, 2, 2, 1, 3
    ])

    private _screenRectangleUVs: Float32Array = Float32Array.from([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ])

    private _screenDrawVertexShader = `
    attribute vec4 aVertexPosition;
    attribute vec2 aUvCoord;

    varying lowp vec2 vUvCoord;

    void main(void) {
        gl_Position = vec4(aVertexPosition.xyz, 1);
        vUvCoord = aUvCoord.xy;
    }
    `;
    
    private _screenDrawPixelShader = `
    varying lowp vec2 vUvCoord;
    uniform sampler2D uTexture;
    void main(void) {
        gl_FragColor = texture2D(uTexture, vUvCoord);
    }
    `;

    private _program: ShaderProgram;
    private _vertexBuffer: WebGLBuffer;
    private _indexBuffer: WebGLBuffer;
    private _uvBuffer: WebGLBuffer;


    constructor (canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        this._drawRequests = new Map<Layer, DrawRequest[]>();
        this._gl = canvas.getContext('webgl', 
        {
            premultipliedAlpha: false,
            alpha: false
        })!;
        const gl = this._gl;

        this._frameBuffer = gl.createFramebuffer()!;
        this._bufferTexture = gl.createTexture()!;
        this._depthBuffer = gl.createRenderbuffer()!;
        gl.bindTexture(gl.TEXTURE_2D, this._bufferTexture);

        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, this._renderWidthPixels, this._renderHeightPixels, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)!;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this._renderWidthPixels, this._renderHeightPixels);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._bufferTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthBuffer);

        const vertexShader = new Shader(gl, ShaderType.VERTEX, this._screenDrawVertexShader);
        const pixelShader = new Shader(gl, ShaderType.PIXEL, this._screenDrawPixelShader);

        this._program = new ShaderProgram(gl, pixelShader, vertexShader);

        this._vertexBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._screenRectangleVertices, gl.STATIC_DRAW);

        this._indexBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._screenRectangleIndices, gl.STATIC_DRAW);

        this._uvBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._screenRectangleUVs, gl.STATIC_DRAW);
    }

    executeDraw(camera: Readonly<Camera>): void {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBuffer);
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.depthFunc(this._gl.LEQUAL);
        this._gl.viewport(0, 0, this._renderWidthPixels, this._renderHeightPixels);

        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        if (this._drawRequests.get(Layer.Background) !== undefined && this._drawRequests.get(Layer.Background)!.length !== 0) {
            this._drawRequests.get(Layer.Background)!.forEach(request => {
                request.draw(camera);
            })
        }

        if (this._drawRequests.get(Layer.Layer0) !== undefined && this._drawRequests.get(Layer.Layer0)!.length !== 0) {
            this._drawRequests.get(Layer.Layer0)!.forEach(request => {
                request.draw(camera);
            })
        }

        if (this._drawRequests.get(Layer.Layer1) !== undefined && this._drawRequests.get(Layer.Layer1) !.length !== 0) {
            this._drawRequests.get(Layer.Layer1)!.forEach(request => {
                request.draw(camera);
            })
        }

        if (this._drawRequests.get(Layer.Foreground) !== undefined && this._drawRequests.get(Layer.Foreground)!.length !== 0) {
            this._drawRequests.get(Layer.Foreground)!.forEach(request => {
                request.draw(camera);
            })
        }

        this.glContext.flush();
        this._drawRequests.clear();

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
        this._gl.viewport(0, 0, this._canvas.width, this._canvas.height);

        // Draw backbuffer to the canvas.
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.disable(this._gl.DEPTH_TEST);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        const vertexPositionAttribLoc = this.glContext.getAttribLocation(this._program.glShaderProgram, "aVertexPosition");
        const uvCoordAttribLoc = this.glContext.getAttribLocation(this._program.glShaderProgram, "aUvCoord");


        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this._vertexBuffer);
        this.glContext.vertexAttribPointer(
            vertexPositionAttribLoc,
            3,
            this.glContext.FLOAT,
            false,
            0,
            0
        );
        this.glContext.enableVertexAttribArray(vertexPositionAttribLoc);
        this.glContext.bindBuffer(this.glContext.ELEMENT_ARRAY_BUFFER, this._indexBuffer);

        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this._uvBuffer);
        this.glContext.vertexAttribPointer(
            uvCoordAttribLoc,
            2,
            this.glContext.FLOAT,
            false,
            0,
            0
        );
        this.glContext.enableVertexAttribArray(uvCoordAttribLoc);

        this.glContext.useProgram(this._program.glShaderProgram);
        this.glContext.activeTexture(this.glContext.TEXTURE0);
        this.glContext.bindTexture(this.glContext.TEXTURE_2D, this._bufferTexture);
        
        this.glContext.drawElements(this.glContext.TRIANGLES, 6, this.glContext.UNSIGNED_SHORT, 0);
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