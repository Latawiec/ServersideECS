
export namespace Serialization {

const identityMatrix: Array<number> = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

type Uuid = string;

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
        blending: number;
        layer: number;
        billboard: boolean;

        // Wrapped properties
        assets: Assets;
        vertexAttributes: VertexAttributes;
        uniformParameters: UniformParameters;

        constructor() {
            this.assets = new Assets();
            this.vertexAttributes = new VertexAttributes();
            this.uniformParameters = new UniformParameters();
            this.transform = identityMatrix;
            this.blending = 0;
            this.layer = 0;
            this.billboard = false;
        }
    }
}

export namespace Camera {
    export class Snapshot {
        transform: Array<number>;
        projection: Array<number>;

        constructor() {
            this.transform = identityMatrix;
            this.projection = identityMatrix;
        }
    }
}

export class ClientSpecificData {
    camera: Camera.Snapshot | undefined
}

export class WorldSnapshot {
    drawable: Record<string, Drawable.Snapshot> = {};
    // TODO: remove camera from here.
    camera: Record<Uuid, Camera.Snapshot> = {};
    clientSpecificData: Record<Uuid, ClientSpecificData> = {};
}

}