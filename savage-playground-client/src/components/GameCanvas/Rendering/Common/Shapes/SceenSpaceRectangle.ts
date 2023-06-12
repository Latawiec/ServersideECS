
import { ShapeData } from "./ShapeData";

export class ScreenSpaceRectangle implements ShapeData {
    vertices = Float32Array.from([
        -1.0, -1.0, 0.0,
        +1.0, -1.0, 0.0,
        -1.0, +1.0, 0.0,
        +1.0, +1.0, 0.0 
    ]);

    uvs = Float32Array.from([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ]);

    indices = Uint16Array.from([
        0, 1, 2, 2, 1, 3
    ]);

    elementsCount = this.indices.length;
}