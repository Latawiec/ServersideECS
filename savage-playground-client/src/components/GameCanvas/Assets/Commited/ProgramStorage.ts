import { AssetStorage } from "../AssetStorage";
import { Shader, ShaderStorage, ShaderType } from "./ShaderStorage";
import { strict as assert } from 'assert';

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

export class ProgramStorage {
    private _programCache = new Map<string, ShaderProgram>();

    private _shaderStorage: ShaderStorage;
    private _assetStorage: AssetStorage;
    private _gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext, assetStorage: AssetStorage) {
        this._assetStorage = assetStorage;
        this._shaderStorage = new ShaderStorage(gl, assetStorage);
        this._gl = gl;
    }

    read(vertexShaderPath: string, pixelShaderPath: string) : Promise<ShaderProgram> {
        return new Promise( async (resolve, reject) => {
            try {
                const vertexShader = await this._shaderStorage.read(ShaderType.VERTEX, vertexShaderPath);
                const pixelShader = await this._shaderStorage.read(ShaderType.PIXEL, pixelShaderPath);
                const pairKey = this.programPairKey(vertexShader, pixelShader);

                if (!this._programCache.has(pairKey)) {
                    const shaderProgram = new ShaderProgram(this._gl, pixelShader, vertexShader);
                    this._programCache.set(pairKey, shaderProgram);
                }
                
                resolve(this._programCache.get(pairKey)!);
            } catch (e) {
                reject(e);
            }
        })
    }

    private programPairKey(vertexShader: Shader, pixelShader: Shader) {
        return vertexShader.id.toString() + ' ' + pixelShader.id.toString();
    }
}