import { strict as assert } from 'assert';
import { AssetStorage } from '../AssetStorage';
import { UuidGenerator } from '../../../../Shared/UuidGenerator'

export enum ShaderType {
    PIXEL = WebGLRenderingContext.FRAGMENT_SHADER,
    VERTEX = WebGL2RenderingContext.VERTEX_SHADER
};


export class Shader {
    private _gl: WebGLRenderingContext;
    private _id: number;
    private _type: ShaderType;
    private _shader: WebGLShader;

    constructor(gl: WebGLRenderingContext, id: number, type: ShaderType, source: Readonly<string>) {
        this._gl = gl;
        this._id = id;
        this._type = type;
        this._shader = this.compileShader(this._gl, source)!;
    }

    release() {
        this._gl.deleteShader(this._shader);
    }

    get type() {
        return this._type;
    }

    get id() {
        return this._id;
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

export class ShaderStorage {
    private _shaderCache = new Map<string, Shader>;
    private _shaderIdGenerator = new UuidGenerator();

    private _assetStorage: AssetStorage;
    private _gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext, assetStorage: AssetStorage) {
        this._assetStorage = assetStorage;
        this._gl = gl;
    }

    read(shaderType: ShaderType, assetPath: string) : Promise<Shader> {
        return new Promise( async (resolve, reject) => {
            if (!this._shaderCache.has(assetPath)) {
                try {
                    const shaderSource = this._assetStorage.fs.readFileSync(assetPath).toString();
                    const shader = new Shader(this._gl, this._shaderIdGenerator.getNext(), shaderType, shaderSource);
                    this._shaderCache.set(assetPath, shader);
                } catch (e) {
                    reject(e);
                }
            }
            resolve(this._shaderCache.get(assetPath)!)
        });
    }
}  