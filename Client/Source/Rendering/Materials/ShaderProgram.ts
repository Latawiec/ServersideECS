import { strict as assert } from 'assert';

export enum ShaderType {
    PIXEL = WebGLRenderingContext.FRAGMENT_SHADER,
    VERTEX = WebGL2RenderingContext.VERTEX_SHADER
};


export class Shader {
    private _gl: WebGLRenderingContext;
    private _type: ShaderType;
    private _shader: WebGLShader;

    constructor(gl: WebGLRenderingContext, type: ShaderType, source: Readonly<string>) {
        this._gl = gl;
        this._type = type;
        this._shader = this.compileShader(this._gl, source)!;
    }

    release() {
        this._gl.deleteShader(this._shader);
    }

    get type() {
        return this._type;
    }

    get glShader() {
        return this._shader;
    }

    private compileShader(gl: WebGLRenderingContext, source: Readonly<string>) : WebGLShader | undefined {
        const shader = gl.createShader(this._type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Failed to compile shader: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return undefined;
        }
        return shader;
    }
};

export class ShaderProgram {
    private _gl: WebGLRenderingContext;
    private _shaderProgram: WebGLProgram;

    constructor(gl: WebGLRenderingContext,
        pixelShader: Shader,
        vertexShader: Shader
    ) {
        assert(pixelShader.type === ShaderType.PIXEL);
        assert(vertexShader.type === ShaderType.VERTEX);

        this._gl = gl;
        this._shaderProgram = this.linkProgram(pixelShader.glShader, vertexShader.glShader)!;
    }

    get glShaderProgram() {
        return this._shaderProgram;
    }

    private linkProgram(ps: WebGLShader, vs: WebGLShader): WebGLProgram | undefined {
        const shaderProgram = this._gl.createProgram()!;
        this._gl.attachShader(shaderProgram, vs);
        this._gl.attachShader(shaderProgram, ps);
        this._gl.linkProgram(shaderProgram);

        if (!this._gl.getProgramParameter(shaderProgram, this._gl.LINK_STATUS)) {
            alert('Failed to link program: ' + this._gl.getProgramInfoLog(shaderProgram));
            return undefined;
        }

        return shaderProgram;
    }
};