import { Serialization } from "@/Shared/WorldSnapshot";
import { AssetStorage } from "../Assets/AssetStorage";
import { CommitedResourceStorage } from "../Assets/Commited/CommitedResourceStorage";
import { Camera, RawCamera } from "./Scene/Camera";
import { ShaderProgram } from "../Assets/Commited/ProgramStorage";
import { Mesh } from "../Assets/Commited/MeshStorage";
import { Texture } from "../Assets/Commited/TextureStorage";
import { mat4, vec3, vec4 } from "gl-matrix";
import { OutputTarget } from "./RenderTarget/OutputTarget";
import { GBufferTarget } from "./RenderTarget/GBufferTarget";
import { DrawTextureProgram } from "./Common/Programs/DrawTextureProgram";

interface DrawRequest {
    draw(camera: Readonly<Camera>): void;
    get zorder(): number;
};


class StandardDrawRequest implements DrawRequest {

    private _gl: WebGLRenderingContext;
    private _program: ShaderProgram;
    private _mesh: Mesh;
    private _textures: Map<number, Texture>;
    private _uniformsAttrs: Record<string, any>;
    private _vertexAttrs: Record<string, any>;
    private _layer: number;
    private _billboard: boolean;
    
    constructor(
        gl: WebGLRenderingContext,
        program: ShaderProgram,
        mesh: Mesh,
        textures: Map<number, Texture>,
        uniformAttributes: Record<string, any>,
        vertexAttributes: Record<string, any>,
        layer: number,
        billboard: boolean = false)
    {
        this._gl = gl;
        this._program = program;
        this._mesh = mesh;
        this._textures = textures;
        this._uniformsAttrs = uniformAttributes;
        this._vertexAttrs = vertexAttributes;
        this._layer = layer;
        this._billboard = billboard;
    }

    // From DrawRequest
    get zorder() : number { 
        return this._layer;
    }

    draw(camera: Readonly<Camera>): void {
        this.prepareProgram();
        this.prepareVertexAttributes();
        this.prepareUniformAttributes();
        this.prepareTextures();
        this.prepareBlending();
        this.holyShitDude(camera); // ;__;
        this.executeDraw();
    }

    private prepareVertexAttributes(): void {
        const gl = this._gl;

        // Vertices and Indices. Can't go without it
        const vertexPositionAttribLoc = gl.getAttribLocation(this._program.glShaderProgram, this._vertexAttrs.vertices);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._mesh.glVertexBuffer);
        gl.vertexAttribPointer(vertexPositionAttribLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexPositionAttribLoc);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._mesh.glIndexBuffer);

        // Optinal attributes
        if (this._vertexAttrs.uv) {
            const uvCoordAttribLoc = gl.getAttribLocation(this._program.glShaderProgram, this._vertexAttrs.uv);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._mesh.glUvBuffer);
            gl.vertexAttribPointer(uvCoordAttribLoc, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(uvCoordAttribLoc);
        }
    }

    private prepareProgram(): void {
        const gl = this._gl;
        gl.useProgram(this._program.glShaderProgram);
    }

    private prepareTextures(): void {
        const gl = this._gl;

        for(const [textureOffset, texture] of this._textures) {
            gl.activeTexture(gl.TEXTURE0 + textureOffset);
            gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);    
        }
    }

    private prepareBlending(): void {
        const gl = this._gl;
        // Just use standard for now.
        //canvas.glContext.blendFunc(canvas.glContext.SRC_ALPHA, canvas.glContext.ONE); // Additive blending.
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // real transparency
    }

    private prepareUniformAttributes(): void {
        const gl = this._gl;

        for (const type in this._uniformsAttrs) {
            const typedValuesArray = this._uniformsAttrs[type];

            for (const uniformName in typedValuesArray) {
                const uniformLoc = gl.getUniformLocation(this._program.glShaderProgram, uniformName);
                const uniformValue = typedValuesArray[uniformName];

                switch (type) {
                    case 'mat4': gl.uniformMatrix4fv(uniformLoc, false, uniformValue as Array<number>);
                        break;

                    case 'float': gl.uniform1f(uniformLoc, parseFloat(uniformValue));
                        break;
                    case 'vec2': gl.uniform2fv(uniformLoc, uniformValue as Array<number>)
                        break;
                    case 'vec3': gl.uniform3fv(uniformLoc, uniformValue as Array<number>)
                        break;
                    case 'vec4': gl.uniform4fv(uniformLoc, uniformValue as Array<number>)
                        break;

                    case 'int': gl.uniform1i(uniformLoc, parseInt(uniformValue))
                        break;
                    case 'ivec2': gl.uniform2iv(uniformLoc, Int32Array.from(uniformValue))
                        break;
                    case 'ivec3': gl.uniform3iv(uniformLoc, Int32Array.from(uniformValue))
                        break;
                    case 'ivec4': gl.uniform4iv(uniformLoc, Int32Array.from(uniformValue))
                        break;

                    default:
                        console.error("Uniform type unknown: %s", type);
                }
            }
        }
    }

    private holyShitDude(camera: Readonly<Camera>): void {
        const gl = this._gl;

        // Off the grid uniforms for the camera. Need to figure out how to pass them.
        const cameraViewLoc = gl.getUniformLocation(this._program.glShaderProgram, 'uCameraData.view');
        const cameraProjLoc = gl.getUniformLocation(this._program.glShaderProgram, 'uCameraData.proj');
        const cameraPosLoc = gl.getUniformLocation(this._program.glShaderProgram, 'uCameraData.position');
        const cameraForwardLoc = gl.getUniformLocation(this._program.glShaderProgram, 'uCameraData.forward');

        // TODO: Move it out of here.
        const invertedViewMatrix = mat4.invert(mat4.create(), camera.viewTransform);
        const cameraPosition = mat4.getTranslation(vec3.create(), invertedViewMatrix);
        const cameraForward = vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, -1, 0), invertedViewMatrix);
        const cameraForward3 = vec3.fromValues(cameraForward[0], cameraForward[1], cameraForward[2]);

        if (this._billboard) {
            // Off the grid uniform for transform. Just to do billboarding... Need to figure it out finally.
            const transformLoc = gl.getUniformLocation(this._program.glShaderProgram, 'uObjectData.transform');
            // TODO: I need to either expose it more cleanly, or push basic object properties to shared struct.
            const objectTransform = this._uniformsAttrs['mat4']['uObjectData.transform'];
            const objectTransform_NoTranslation = mat4.copy(mat4.create(), objectTransform);

            const transformVec = [
                objectTransform_NoTranslation[12],
                objectTransform_NoTranslation[13],
                objectTransform_NoTranslation[14],
                objectTransform_NoTranslation[15]
            ]

            objectTransform_NoTranslation[12] = 0;
            objectTransform_NoTranslation[13] = 0;
            objectTransform_NoTranslation[14] = 0;
            objectTransform_NoTranslation[15] = 1;


            const billboard = mat4.lookAt(mat4.create(),
                [0, 0, 0],
                cameraPosition,
                vec3.fromValues(0, 1, 0)
            );
            
            let transform = mat4.mul(mat4.create(), billboard, objectTransform_NoTranslation);
            
            transform[12] = transformVec[0];
            transform[13] = transformVec[1];
            transform[14] = transformVec[2];
            transform[15] = transformVec[3];
            
            gl.uniformMatrix4fv(
                transformLoc,
                false,
                transform
            );
        }

        gl.uniformMatrix4fv(
            cameraViewLoc,
            false,
            Array.from(camera.viewTransform)
        );

        gl.uniformMatrix4fv(
            cameraProjLoc,
            false,
            Array.from(camera.transform)
        )

        gl.uniform3fv(
            cameraPosLoc,
            Array.from(cameraPosition)
        )

        gl.uniform3fv(
            cameraForwardLoc,
            Array.from(cameraForward3)
        )
    }

    private executeDraw(): void {
        const gl = this._gl;
        gl.drawElements(gl.TRIANGLES, this._mesh.elementsCount, gl.UNSIGNED_SHORT, 0);
    }

}

export class GameRenderer {
    private _commitedResources: CommitedResourceStorage;
    private _gl: WebGLRenderingContext;
    private _gBufferTarget: GBufferTarget;
    private _outputTarget: OutputTarget;
    private _outputProgram: DrawTextureProgram; // TODO: Do I need it?
    private _activeCamera: Camera | undefined;

    constructor(canvas: HTMLCanvasElement, assetStorage: AssetStorage) {
        const gl = canvas.getContext('webgl',
            {
                alpha: false
            }
        )!;

        this._gl = gl;
        this._commitedResources = new CommitedResourceStorage(gl, assetStorage);
        this._gBufferTarget = new GBufferTarget(gl, canvas.width, canvas.height);
        this._outputTarget = new OutputTarget(gl, canvas.width, canvas.height);
        this._outputProgram = new DrawTextureProgram(gl); // TODO: Do I need it?
    }

    set camera(snapshot: Readonly<Serialization.Camera.Snapshot>) {
        this._activeCamera = new RawCamera(mat4.copy(mat4.create(), Float32Array.from(snapshot.transform)), mat4.copy(mat4.create(), Float32Array.from(snapshot.projection)));
    }
    
    async render(snapshot: Readonly<Serialization.WorldSnapshot>) {
        if (!this._activeCamera) {
            return;
        }
        const camera = this._activeCamera;

        const gl = this._gl;
        const renderList = await this.prepareRenderList(snapshot);
        
        this._gBufferTarget.bind();
        gl.clearColor(49/256.0, 85/256, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Sort renderList by zorder.
        let lastLayer = 0;
        [...renderList]
            .sort((lhs, rhs): number => { return lhs[1].zorder - rhs[1].zorder })
            .forEach(( [drawableId, drawRequest] )  => {
                if (drawRequest.zorder != lastLayer) {
                    // Flush after processing each layer.
                    lastLayer = drawRequest.zorder;
                    gl.flush();
                }
                drawRequest.draw(camera);
            }
        );
        gl.flush();

        this._outputTarget.bind();
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);

        this._outputProgram.use();
        this._outputProgram.draw(this._gBufferTarget.colorOutput);
    }

    private async prepareRenderList(snapshot: Readonly<Serialization.WorldSnapshot>) : Promise<Map<string, DrawRequest>> {
        const newRenderList = new Map<string, DrawRequest>();
        const gl = this._gl;

        for (const drawableId in snapshot.drawable) {
            const drawable = snapshot.drawable[drawableId];

            // Shaders
            const vertexShaderPath = drawable.assets.vertexShader!;
            const pixelShaderPath = drawable.assets.pixelShader!;
            const program = await this._commitedResources.programs.read(vertexShaderPath, pixelShaderPath);

            // Mesh
            const meshDataPath = drawable.assets.mesh!;
            const mesh = await this._commitedResources.meshes.read(meshDataPath);

            // Textures
            const textures = new Map<number, Texture>();
            for(const textureOffset in drawable.assets.textures) {
                const texturePath = drawable.assets.textures[textureOffset];
                const texture = await this._commitedResources.textures.read(texturePath);
                textures.set(parseInt(textureOffset), texture);
            }

            // Prepare Request
            const drawRequest = new StandardDrawRequest(gl,
                program, mesh, textures,
                drawable.uniformParameters, drawable.vertexAttributes,
                drawable.layer, drawable.billboard);
            
                newRenderList.set(drawableId, drawRequest);
        }

        return newRenderList;
    }
}