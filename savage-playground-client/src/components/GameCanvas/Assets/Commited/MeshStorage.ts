import { AssetStorage } from "../AssetStorage";


export class Mesh {
    private _vertexBuffer: WebGLBuffer;
    private _indexBuffer: WebGLBuffer;
    private _uvBuffer: WebGLBuffer;
    private _elementsCount: number; 

    constructor(glContext: WebGLRenderingContext, vertices: Float32Array, indices: Uint16Array, uv: Float32Array) {
        this._vertexBuffer = glContext.createBuffer()!;
        this._indexBuffer = glContext.createBuffer()!;
        this._uvBuffer = glContext.createBuffer()!;

        glContext.bindBuffer(glContext.ARRAY_BUFFER, this._vertexBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW);

        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, indices, glContext.STATIC_DRAW);

        glContext.bindBuffer(glContext.ARRAY_BUFFER, this._uvBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, uv, glContext.STATIC_DRAW)

        this._elementsCount = indices.length;
    }

    get glVertexBuffer(): Readonly<WebGLBuffer> { return this._vertexBuffer; }
    get glIndexBuffer(): Readonly<WebGLBuffer> { return this._indexBuffer; }
    get glUvBuffer(): Readonly<WebGLBuffer> { return this._uvBuffer; }
    get elementsCount(): Readonly<number> { return this._elementsCount; }
}

export class MeshStorage {
    private _meshCache = new Map<string, Mesh>;

    private _assetStorage: AssetStorage;
    private _gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext, assetStorage: AssetStorage) {
        this._assetStorage = assetStorage;
        this._gl = gl;
    }

    read(assetPath: string) : Promise<Mesh> {
        return new Promise( async (resolve, reject) => {
            if (!this._meshCache.has(assetPath)) {
                try {
                    // TODO: Define type?
                    const meshData = JSON.parse(this._assetStorage.fs.readFileSync(assetPath).toString());
                    const mesh = new Mesh(this._gl, Float32Array.from(meshData.vertices), Uint16Array.from(meshData.indices), Float32Array.from(meshData.uv));
                    this._meshCache.set(assetPath, mesh);
                } catch (e) {
                    reject(e);
                }
            }
            resolve(this._meshCache.get(assetPath)!);
        })
    }
}