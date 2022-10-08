
export namespace CommonShapes {

export interface Mesh {
    get vertices(): Float32Array;
    get indices(): Uint16Array;
}

export class Square implements Mesh {
    private _vertices = Float32Array.from([
         1.0,  0.0,  1.0,
        -1.0,  0.0,  1.0,
         1.0,  0.0, -1.0,
        -1.0,  0.0, -1.0 
    ]);

    private _indices = Uint16Array.from([
        0, 1, 2, 2, 1, 3
    ]);

    private _uv = Float32Array.from([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
    ]);

    get vertices(): Readonly<Float32Array> {
        return this._vertices;
    }
    get indices(): Readonly<Uint16Array> {
        return this._indices;
    }
    get uv(): Readonly<Float32Array> {
        return this._uv;
    }
};

export class ScreenSpaceRectangle implements Mesh {
    private _vertices = Float32Array.from([
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
       -1.0,  1.0, 0.0,
        1.0,  1.0, 0.0 
    ]);

    private _indices = Uint16Array.from([
        0, 1, 2, 2, 1, 3
    ]);

    private _uv = Float32Array.from([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ]);

    get vertices(): Readonly<Float32Array> {
        return this._vertices;
    }
    get indices(): Readonly<Uint16Array> {
        return this._indices;
    }
    get uv(): Readonly<Float32Array> {
        return this._uv;
    }
}


}