import PNG from 'png-ts';
import { AssetStorage } from '../AssetStorage';

class Image {
    data: Uint8Array;
    width: number;
    height: number;

    constructor(imageData: Uint8Array, width: number, height: number) {
        this.data = imageData;
        this.width = width;
        this.height = height;
    }

    static fromPNG(pngFileData: Readonly<Uint8Array>) : Image {
        const tmp = PNG.load(pngFileData);
        const imageData = tmp.decodePixels();

        return new Image(imageData, tmp.width, tmp.height);
    }
}

export class Texture {
    private _texture: WebGLTexture;

    constructor(glContext: WebGLRenderingContext, textureImage: Image) {

        this._texture = glContext.createTexture()!;

        // TODO: I should parametrize these in construction.
        glContext.bindTexture(glContext.TEXTURE_2D, this._texture);
        glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, textureImage.width, textureImage.height, 0, glContext.RGBA, glContext.UNSIGNED_BYTE, textureImage.data);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, glContext.NEAREST);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.NEAREST);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);
    }

    get glTexture(): Readonly<WebGLTexture> { return this._texture }
}

export class TextureStorage {
    private _textureCache = new Map<string, Texture>;
    
    private _assetStorage: AssetStorage;
    private _gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext, assetStorage: AssetStorage) {
        this._assetStorage = assetStorage;
        this._gl = gl;
    }

    read(assetPath: string) : Promise<Texture> {
        return new Promise( async (resolve, reject) => {
            if (!this._textureCache.has(assetPath)) {
                try {
                    // For now we'll assume all images are PNG.
                    const pngFileData = new Uint8Array(this._assetStorage.fs.readFileSync(assetPath) as Buffer);
                    const image = Image.fromPNG(pngFileData);

                    const texture = new Texture(this._gl, image);
                    this._textureCache.set(assetPath, texture);
                } catch (e) {
                    reject(e);
                }
            }
            resolve(this._textureCache.get(assetPath)!);
        })
    }
}