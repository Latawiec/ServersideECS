import { Camera, PerspectiveCamera, RawCamera } from "./Rendering/Basic/Camera";
import { DrawSquareRequest } from "./DrawSquareRequest";
import { Layer, Canvas, DrawRequest } from "./Rendering/Canvas";
import { Shader, ShaderProgram, ShaderType } from "./Rendering/Materials/ShaderProgram";
import { mat4, vec4, vec3, vec2 } from "gl-matrix";
import { send } from "process";
import { DrawSpriteSegmentRequest } from "./DrawSpriteSegmentRequest";
import { DrawTextureSquareRequest } from "./DrawTextureSquareRequest";
import { DrawCircleAoeRequest } from "./DrawCircleAoeRequest";
import PNG from 'png-ts';
import { DrawRectangleAoeRequest } from "./DrawRectangleAoeRequest";
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

const meshCache = new Map<string, BasicMesh>();
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
        var transform: mat4 = entity.components.transform;

        // grab camera
        if (entity.components.camera !== undefined) {
            const cameraComponent = entity.components.camera;
            camera = new RawCamera(mat4.copy(mat4.create(), cameraComponent.transform), mat4.copy(mat4.create(), cameraComponent.projection));
        }

        oldDrawing: {
            if (entity.components.drawing !== undefined) {
                let request: DrawRequest;
                const drawComponent = entity.components.drawing;
                if (drawComponent.transform) {
                    transform = drawComponent.transform;
                }
                const assetPaths = drawComponent.assetPaths as Array<string>;
                const type: number = entity.components.drawing?.type;
                const componentId = drawComponent.componentId;

                if (entitiesToDraw.has(componentId)) 
                {
                    const request = entitiesToDraw.get(componentId)!;
                    if (type == 0) {
                        // Fix this "any"
                        let square = request as any;
                        square.transform = transform;
                        if (drawComponent.color != undefined) {
                            square.color = drawComponent.color;
                        }
                    } else
                    if (type == 1) { 
                        let spriteRequest = request as DrawSpriteSegmentRequest;
                        const spriteSelect = entity.components.drawing!.selectedSegment;
                        spriteRequest.transform = transform;
                        spriteRequest.spriteSelect = vec2.fromValues(spriteSelect[0], spriteSelect[1]);
                    } else 
                    if (type == 2) {
                        let closedAoeCircle = request as DrawCircleAoeRequest;
                        closedAoeCircle.transform = transform;
                    } else
                    if (type == 3) {
                        let closedAoeRect = request as DrawRectangleAoeRequest;
                        closedAoeRect.transform = transform;
                    }
                    newToDraw.set(componentId, request);
                    break oldDrawing;
                } else {
                    // console.log("Doesn't have: " + name);
                }

                if (awaitedDrawRequests.has(componentId))
                {
                    if (awaitedDrawRequests.get(componentId) != undefined) {
                        newToDraw.set(componentId, awaitedDrawRequests.get(componentId)!);
                        awaitedDrawRequests.delete(componentId);
                    }
                    break oldDrawing;
                }

                // Create new draw request. Such object hasn't been registered for drawing yet.
                if (type == 0) {
                    if (assetPaths.length > 0 && assetPaths[0] != "") {
                        awaitedDrawRequests.set(componentId, undefined);
                        getAsset(assetPaths[0], (data) => {
                            const image = pngDecode(data);
                            const texturedSquareRequest = new DrawTextureSquareRequest(canvas.glContext, image.data, image.width, image.height);
                            texturedSquareRequest.transform = transform;
                            awaitedDrawRequests.set(componentId, texturedSquareRequest);
                        });
                        break oldDrawing;
                    } else {
                        const plainSquareRequest = new DrawSquareRequest(canvas.glContext);
                        plainSquareRequest.transform = transform;

                        newToDraw.set(componentId, plainSquareRequest);
                        break oldDrawing;
                    }
                } else 
                if (type == 1) {
                    if (assetPaths.length > 0 && assetPaths[0] != "") {
                        awaitedDrawRequests.set(componentId, undefined);
                        getAsset(assetPaths[0], (data) => {
                            const image = pngDecode(data);
                            const spriteRequest = new DrawSpriteSegmentRequest(canvas.glContext, image.data, image.width, image.height);
                            const spriteSelect = entity.components.drawing!.selectedSegment;
                            spriteRequest.transform = transform;
                            spriteRequest.spriteSelect = vec2.fromValues(spriteSelect[0], spriteSelect[1]);
                            awaitedDrawRequests.set(componentId, spriteRequest);
                        });
                        break oldDrawing;
                    }
                } else 
                if (type == 2) {
                    const aoeCircleRequest = new DrawCircleAoeRequest(canvas.glContext);
                    aoeCircleRequest.transform = transform;
                    newToDraw.set(componentId, aoeCircleRequest);
                    break oldDrawing;
                } else
                if (type == 3) {
                    console.log("Got 3");
                    const aoeRectangleRequest = new DrawRectangleAoeRequest(canvas.glContext);
                    aoeRectangleRequest.transform = transform;
                    newToDraw.set(componentId, aoeRectangleRequest);
                    break oldDrawing;
                }
            }
        }
        

        // The new drawable. All controll passed over to the server.
        if (entity.components.drawableComponent !== undefined) {
            const gl = canvas.glContext;

            const drawableComponent = entity.components.drawableComponent;

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


                draw(camera: Readonly<Camera>): void {
                    // Why is aVertexPosition hardcoded?
                    const vertexPositionAttribLoc = gl.getAttribLocation(this._shaderProgram.glShaderProgram, 'aVertexPosition');

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
                    gl.useProgram(this._shaderProgram.glShaderProgram);

                    for(const key in this._uniformAttributes) {
                        const value = this._uniformAttributes[key];

                        const uniformLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, key);

                        if (uniformLoc === null ){
                            console.log('null')
                        }

                        if (Array.isArray(value)) {
                            const array: Array<number> = value
                            const size = array.length;

                            if (size === 16) {
                                gl.uniformMatrix4fv(
                                    uniformLoc,
                                    false,
                                    array
                                )
                            }

                            if (size === 4) {
                                gl.uniform4fv(
                                    uniformLoc,
                                    array
                                )
                            }

                            if (size === 3) {
                                gl.uniform3fv(
                                    uniformLoc,
                                    array
                                )
                            }
                        } 
                        else
                        if (!isNaN(+value)) {
                            gl.uniform1f(
                                uniformLoc,
                                parseFloat(value)
                            )
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

