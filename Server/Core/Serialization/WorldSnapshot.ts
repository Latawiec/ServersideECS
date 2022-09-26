import { Uuid } from "@core/Base/UuidGenerator"
import { mat4 } from "gl-matrix"


export namespace Serialization {

export interface ISnapshot<T> {
    takeSnapshot(): T;
}

export namespace Drawable {

    export class Assets {
        vertexShader: string | undefined = undefined;
        pixelShader: string | undefined = undefined;
        mesh: string | undefined = undefined;
        textures: Record<number, string> = {};
    }

    export class VertexAttributes {
        vertices: string | undefined = undefined;
        uv: string | undefined = undefined;
    }

    export class UniformParameters {
        float:  Record<string, number>        = {}
        vec2:   Record<string, Array<number>> = {}
        vec3:   Record<string, Array<number>> = {}
        vec4:   Record<string, Array<number>> = {}
        int:    Record<string, number>        = {}
        ivec2:  Record<string, Array<number>> = {}
        ivec3:  Record<string, Array<number>> = {}
        ivec4:  Record<string, Array<number>> = {}
        mat4:   Record<string, Array<number>> = {}
    }

    export class Snapshot {
        // Direct properties
        transform: Array<number>;

        // Wrapped properties
        assets: Assets;
        vertexAttributes: VertexAttributes;
        uniformParameters: UniformParameters;

        constructor() {
            this.assets = new Assets();
            this.vertexAttributes = new VertexAttributes();
            this.uniformParameters = new UniformParameters();
            this.transform = Array.from(mat4.create());
        }
    }
}

export namespace Camera {
    export class Snapshot {
        transform: Array<number>;
        projection: Array<number>;

        constructor() {
            this.transform = Array.from(mat4.create());
            this.projection = Array.from(mat4.create());
        }
    }
}

export class WorldSnapshot {
    drawable: Record<Uuid, Drawable.Snapshot> = {};
    camera: Record<Uuid, Camera.Snapshot> = {};
}

}