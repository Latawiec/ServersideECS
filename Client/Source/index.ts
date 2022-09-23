import { Camera, PerspectiveCamera, RawCamera } from "./Rendering/Basic/Camera";
import { Layer, Canvas, DrawRequest } from "./Rendering/Canvas";
import { Shader, ShaderProgram, ShaderType } from "./Rendering/Materials/ShaderProgram";
import { mat4, vec4, vec3, vec2 } from "gl-matrix";
import { send } from "process";
import PNG from 'png-ts';
import unzipper from "unzipper"
import path from "path"
import * as fs from "fs"
import { MemoryFilesystem } from "./MemoryFilesystem";

const {
    Readable,
    Writable,
    Transform,
    Duplex,
    pipeline,
    finished
  } = require('readable-stream')

console.log(location.host);
const ws = new WebSocket('ws://' + location.host);
let assetsLoaded = false;

class BasicMesh {
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

class BasicTexture {
    private _texture: WebGLTexture;

    constructor(glContext: WebGLRenderingContext, texturePath: string) {

        this._texture = glContext.createTexture()!;

        const image = pngDecode(new Uint8Array(MemoryFilesystem.fs.readFileSync(texturePath) as Buffer))

        glContext.bindTexture(glContext.TEXTURE_2D, this._texture);
        glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, image.width, image.height, 0, glContext.RGBA, glContext.UNSIGNED_BYTE, image.data);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, glContext.NEAREST);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.NEAREST);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);
    }

    get glTexture(): Readonly<WebGLTexture> { return this._texture }
}

const meshCache = new Map<string, BasicMesh>();
const textureCache = new Map<string, BasicTexture>();
const compiledShaderCache = new Map<string, Shader>();

const drawableComponentProgramCache = new Map<string, ShaderProgram>();

function fetchAssets() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "worldAssets", true );
    xmlHttp.responseType = "arraybuffer";
    xmlHttp.onload = function() {
        var arrayBuffer = xmlHttp.response;
        var stream = new Duplex();
        stream.push(new Uint8Array(arrayBuffer));
        stream.push(null);
        stream
        .pipe(unzipper.Parse())
        .on('entry', function(entry: any) {
            // Cut off the .zip file name.
            const relativePath = entry.path.split(path.sep).slice(1).join(path.sep);
            if (relativePath !== '') {
                if (entry.type === 'Directory') {
                    MemoryFilesystem.fs.mkdirSync(relativePath);
                }
                if (entry.type === 'File') {
                    (entry.buffer() as Promise<Buffer>).then((buffer) => {
                        MemoryFilesystem.fs.writeFileSync(relativePath, buffer);
                        console.log('File: ' + relativePath);
                    });
                }
            }
            entry.autodrain();
        })
        .promise()
        .then( () => {
            assetsLoaded = true;
        })
    }
    xmlHttp.send(null);
}

function getAsset(assetPath: string, onReceive: (data: Readonly<Uint8Array>) => void)
{
    MemoryFilesystem.fs.readFile(assetPath, (err, data) =>{
        if (err) {
            console.log("Can't read file: ", assetPath)
            console.log(err)
            return;
        }

        if (data) {
            onReceive(new Uint8Array(data as Buffer))
        }
    })
    // var xmlHttp = new XMLHttpRequest();
    // xmlHttp.open( "GET", "asset?path=" + assetPath, true );
    // xmlHttp.responseType = "arraybuffer";
    // xmlHttp.onload = function() {
    //     var arrayBuffer = xmlHttp.response;
    //     var byteArray = new Uint8Array(arrayBuffer);
    //     onReceive(byteArray);
    // }
    // xmlHttp.send(null);
}

class Image {
    data: Uint8Array;
    width: number;
    height: number;

    constructor(imageData: Uint8Array, width: number, height: number) {
        this.data = imageData;
        this.width = width;
        this.height = height;
    }
}

function pngDecode(data: Readonly<Uint8Array>) : Image
{
    const tmp = PNG.load(data);
    const imageData = tmp.decodePixels();
    
    return new Image(imageData, tmp.width, tmp.height);
}

ws.onopen = function() {
    console.log('WebSocketClient Connected');
    fetchAssets()

}

document.addEventListener('keyup', function(event) {
    var charCode = event.key;
    ws.send(JSON.stringify({
        playerInput: {
            keyReleased: charCode
        }
    }));
});

document.addEventListener('keydown', function(event) {
    var charCode = event.key;
    ws.send(JSON.stringify({
        playerInput: {
            keyPressed: charCode,
        }
    }));
});

document.getElementById('connectButton')!.onclick = () =>
{
    const playerNameInput = document.getElementById('playerName') as HTMLInputElement;
    const playerName = playerNameInput.value;

    const connectionRequest = {
        connectionRequest: {
            playerName: playerName
        }
    };

    ws.send(JSON.stringify(connectionRequest));
}

const htmlCanvas = document.getElementById('glCanvas') as HTMLCanvasElement;
if (htmlCanvas === null) 
{
    console.error("Canvas is null...");
}
const canvas = new Canvas(document.getElementById('glCanvas') as HTMLCanvasElement);



const sleep = async (ms: number) => new Promise(r => setTimeout(r, ms));
var entitiesToDraw = new Map<string, DrawRequest>();
var awaitedDrawRequests = new Map<string, DrawRequest | undefined>();

// Test Alpha Blend.
canvas.glContext.enable(canvas.glContext.DEPTH_TEST);
canvas.glContext.enable(canvas.glContext.BLEND);
canvas.glContext.blendFunc(canvas.glContext.SRC_ALPHA, canvas.glContext.ONE_MINUS_SRC_ALPHA);
//canvas.glContext.blendFunc(canvas.glContext.ONE, canvas.glContext.ONE_MINUS_SRC_ALPHA);
// canvas.glContext.blendFuncSeparate(
//     canvas.glContext.SRC_ALPHA,
//     canvas.glContext.ONE_MINUS_SRC_ALPHA,
//     canvas.glContext.ONE,
//     canvas.glContext.ONE);

async function render(world: any) {

    if (!assetsLoaded) return;

    let camera = undefined;

    // We'll be swaping DrawRequests and asigning to currently existing names lol. Kinda makes it easier to implement.
    const newToDraw = new Map<string, DrawRequest>();
    world.entities?.forEach((entity: any) => {

        // grab camera
        if (entity.components.camera !== undefined) {
            const cameraComponent = entity.components.camera;
            camera = new RawCamera(mat4.copy(mat4.create(), cameraComponent.transform), mat4.copy(mat4.create(), cameraComponent.projection));
        }
        
        // The new drawable. All controll passed over to the server.
        if (entity.components.drawableComponents !== undefined) {
            for (const drawableComponent of entity.components.drawableComponents) {
                const gl = canvas.glContext;

                const vertexShaderPath = drawableComponent.assetPaths.vertexShader;
                const pixelShaderPath = drawableComponent.assetPaths.pixelShader;

                if (!compiledShaderCache.has(vertexShaderPath)) {
                    const shader = new Shader(gl, ShaderType.VERTEX, MemoryFilesystem.fs.readFileSync(vertexShaderPath).toString());
                    compiledShaderCache.set(vertexShaderPath, shader);
                }

                if (!compiledShaderCache.has(pixelShaderPath)) {
                    const shader = new Shader(gl, ShaderType.PIXEL, MemoryFilesystem.fs.readFileSync(pixelShaderPath).toString());
                    compiledShaderCache.set(pixelShaderPath, shader);
                }

                const vertexShader = compiledShaderCache.get(vertexShaderPath)!
                const pixelShader = compiledShaderCache.get(pixelShaderPath)!
                
                const meshDataPath = drawableComponent.assetPaths.mesh;
                
                if (!meshCache.has(meshDataPath)) {
                    const meshData = JSON.parse(MemoryFilesystem.fs.readFileSync(meshDataPath).toString());
                    const mesh = new BasicMesh(gl, Float32Array.from(meshData.vertices), Uint16Array.from(meshData.indices), Float32Array.from(meshData.uv))
                    meshCache.set(meshDataPath, mesh);
                }

                if (drawableComponent.assetPaths.textures) {
                    for (const texturePath of drawableComponent.assetPaths.textures) {
                        if (!textureCache.has(texturePath)) {
                            const texture = new BasicTexture(gl, texturePath);
                            textureCache.set(texturePath, texture);
                        }
                    }
                }

                if (!drawableComponentProgramCache.has(drawableComponent.componentId)) {
                    const shaderProgram = new ShaderProgram(gl, pixelShader, vertexShader);
                    drawableComponentProgramCache.set(drawableComponent.componentId, shaderProgram)
                }

                const mesh = meshCache.get(meshDataPath);
                const shaderProgram = drawableComponentProgramCache.get(drawableComponent.componentId)!;

                class DrawStuff implements DrawRequest {
                    private _shaderProgram = shaderProgram;
                    private _mesh = mesh;
                    private _uniformAttributes : Record<string, any> = drawableComponent.uniformParameters!
                    private _textures : string[] = drawableComponent.assetPaths.textures;
                    private _vertexAttributes : Record<string, any> = drawableComponent.vertexAttributes!


                    draw(camera: Readonly<Camera>): void {
                        
                        if (this._vertexAttributes.vertices === undefined ) {
                            console.log("No vertices.")
                        }

                        const vertexPositionAttribLoc = gl.getAttribLocation(this._shaderProgram.glShaderProgram, this._vertexAttributes.vertices);

                        gl.bindBuffer(gl.ARRAY_BUFFER, this._mesh!.glVertexBuffer);
                        gl.vertexAttribPointer(
                            vertexPositionAttribLoc,
                            3,
                            gl.FLOAT,
                            false,
                            0,
                            0
                        );
                        gl.enableVertexAttribArray(vertexPositionAttribLoc);
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._mesh!.glIndexBuffer);
                        
                        if (this._vertexAttributes.uv) {
                            const uvCoordAttribLoc = gl.getAttribLocation(this._shaderProgram.glShaderProgram, this._vertexAttributes.uv);

                            gl.bindBuffer(gl.ARRAY_BUFFER, this._mesh!.glUvBuffer);
                            gl.vertexAttribPointer(
                                uvCoordAttribLoc,
                                2,
                                gl.FLOAT,
                                false,
                                0,
                                0
                            );
                            gl.enableVertexAttribArray(uvCoordAttribLoc);
                        }

                        gl.useProgram(this._shaderProgram.glShaderProgram);

                        if (this._textures) {
                            let index = 0;
                            for(const texturePath of this._textures) {
                                gl.activeTexture(gl.TEXTURE0 + index);
                                gl.bindTexture(gl.TEXTURE_2D, textureCache.get(texturePath)!.glTexture);
                                index++;
                            }
                        }
    
                        for(const type in this._uniformAttributes) {
                            const typedValuesArray = this._uniformAttributes[type];

                            for (const uniformName in typedValuesArray) {
                                // TODO: Replace fetching locations by names with locations coming from server already. A lot of data wasted.
                                const uniformLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, uniformName);
                                const uniformValue = typedValuesArray[uniformName];
                                
                                switch(type) {

                                    case 'mat4':
                                        gl.uniformMatrix4fv(
                                            uniformLoc,
                                            false,
                                            uniformValue as Array<number>
                                        )
                                        break;

                                    case 'float':
                                        gl.uniform1f(
                                            uniformLoc,
                                            parseFloat(uniformValue)
                                        )
                                        break;
                                    case 'vec2':
                                        gl.uniform2fv(
                                            uniformLoc,
                                            uniformValue as Array<number>
                                        )
                                        break;
                                    case 'vec3':
                                        gl.uniform3fv(
                                            uniformLoc,
                                            uniformValue as Array<number>
                                        )
                                        break;
                                    case 'vec4':
                                        gl.uniform4fv(
                                            uniformLoc,
                                            uniformValue as Array<number>
                                        )
                                        break;
                                    
                                    case 'int':
                                        gl.uniform1i(
                                            uniformLoc,
                                            parseInt(uniformValue)
                                        )
                                        break;
                                    case 'ivec2':
                                        gl.uniform2iv(
                                            uniformLoc,
                                            Int32Array.from(uniformValue)
                                        )
                                        break;
                                    case 'ivec3':
                                        gl.uniform3iv(
                                            uniformLoc,
                                            Int32Array.from(uniformValue)
                                        )
                                        break;
                                    case 'ivec4':
                                        gl.uniform4iv(
                                            uniformLoc,
                                            Int32Array.from(uniformValue)
                                        )
                                        break;

                                    default:
                                        console.error("Uniform type unknown: %s", type);
                                }
                                
                            }
                        }

                        // Off the grid uniforms for the camera. Need to figure out how to pass them.
                        const cameraViewLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'uCameraData.view');
                        const cameraProjLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'uCameraData.proj');

                        gl.uniformMatrix4fv(
                            cameraViewLoc,
                            false,
                            camera.viewTransform
                        );

                        gl.uniformMatrix4fv(
                            cameraProjLoc,
                            false,
                            camera.transform
                        )
                        // debugger;
                        //canvas.glContext.blendFunc(canvas.glContext.SRC_ALPHA, canvas.glContext.ONE); // Additive blending.
                        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // real transparency
                        // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
                        gl.drawElements(gl.TRIANGLES, this._mesh!.elementsCount, gl.UNSIGNED_SHORT, 0);
                    }
                }

                const request = new DrawStuff();
                newToDraw.set(drawableComponent.componentId, request);

            }
        }
    });

    entitiesToDraw = newToDraw;

    entitiesToDraw.forEach((request, name) => {
        canvas.requestDraw(Layer.Foreground, request);
    });

    //await sleep(16);
    // canvas.requestDraw(Layer.Background, squareDraw);
    if (camera !== undefined) {
        canvas.executeDraw(camera);
    }
    // requestAnimationFrame(render);
}

ws.onmessage = function(e) {
    // console.log("Got: " + e.data);
    const worldMostLikely = JSON.parse(e.data);
    render(worldMostLikely);
}

// requestAnimationFrame(render);

