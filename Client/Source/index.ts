import { Camera, PerspectiveCamera, RawCamera } from "./Rendering/Basic/Camera";
import { Canvas, DrawRequest } from "./Rendering/Canvas";
import { Shader, ShaderProgram, ShaderType } from "./Rendering/Materials/ShaderProgram";
import { mat4, vec4, vec3, vec2 } from "gl-matrix";
import { send } from "process";
import PNG from 'png-ts';
import unzipper from "unzipper"
import path from "path"
import * as fs from "fs"
import { MemoryFilesystem } from "./MemoryFilesystem";
import deepmerge from "deepmerge";
import { Serialization } from "@shared/WorldSnapshot";
import { GameInputRequest } from "@shared/Communication/Request/GameInputRequest";
import { ClientRequest, ClientRequestType } from "@shared/Communication/Request/ClientRequest";
import { JoinRoomRequest } from "@shared/Communication/Request/JoinRoomRequest";
import { CreateRoomRequest } from "@shared/Communication/Request/CreateRoomRequest";
import { GameStartRequest } from "@shared/Communication/Request/GameStartRequest";
import { GameConfigureRequest } from "@shared/Communication/Request/GameConfigureRequest";
import { ServerResponse, ServerResponseType } from "@shared/Communication/Response/ServerResponse";
import { GameUpdateResponse } from "@shared/Communication/Response/GameUpdateResponse";
import { GamePreparationResponse } from "@shared/Communication/Response/GamePreparationResponse"
import { GamePreparationRequest } from "@shared/Communication/Request/GamePreparationRequest"

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

function fetchAssetPackage(packagePath: string, onDone: ()=>void) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "assetPackage?path=" + packagePath, true );
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
            onDone();
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
}

document.addEventListener('keyup', function(event) {
    const request = new GameInputRequest();
    request.keyReleased = event.key;

    ws.send(JSON.stringify(
        request
    ));
});

document.addEventListener('keydown', function(event) {
    const request = new GameInputRequest();
    request.keyPressed = event.key;

    ws.send(JSON.stringify(
        request
    ));
});

document.getElementById('connectButton')!.onclick = () => {
    ws.send(JSON.stringify(new CreateRoomRequest()))
    const joinRoomRequest = new JoinRoomRequest();
    joinRoomRequest.roomId = 0;
    ws.send(JSON.stringify(joinRoomRequest));
    ws.send(JSON.stringify(new GameConfigureRequest()));
    ws.send(JSON.stringify(new GameStartRequest()));
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

async function render(world: Readonly<Serialization.WorldSnapshot>) {

    if (!assetsLoaded) return;

    let camera = undefined;

    // We'll be swaping DrawRequests and asigning to currently existing names lol. Kinda makes it easier to implement.
    const newToDraw = new Map<string, DrawRequest>();

    for (const drawableId in world.drawable) {
        const gl = canvas.glContext;
        const drawableComponent = world.drawable[drawableId];

        const vertexShaderPath = drawableComponent.assets.vertexShader!;
        const pixelShaderPath = drawableComponent.assets.pixelShader!;

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
        
        const meshDataPath = drawableComponent.assets.mesh!;
        
        if (!meshCache.has(meshDataPath)) {
            const meshData = JSON.parse(MemoryFilesystem.fs.readFileSync(meshDataPath).toString());
            const mesh = new BasicMesh(gl, Float32Array.from(meshData.vertices), Uint16Array.from(meshData.indices), Float32Array.from(meshData.uv))
            meshCache.set(meshDataPath, mesh);
        }

if (drawableComponent.assets.textures) {
    for (const textureOffset in drawableComponent.assets.textures ?: []) {
                const texturePath = drawableComponent.assets.textures[textureOffset]
                if (!textureCache.has(texturePath)) {
                    const texture = new BasicTexture(gl, texturePath);
                    textureCache.set(texturePath, texture);
                }
            }
        }

        if (!drawableComponentProgramCache.has(drawableId)) {
            const shaderProgram = new ShaderProgram(gl, pixelShader, vertexShader);
            drawableComponentProgramCache.set(drawableId, shaderProgram)
        }

        const mesh = meshCache.get(meshDataPath);
        const shaderProgram = drawableComponentProgramCache.get(drawableId)!;

        class DrawStuff implements DrawRequest {
            private _shaderProgram = shaderProgram;
            private _mesh = mesh;
            private _uniformAttributes : Record<string, any> = drawableComponent.uniformParameters!
            private _textures = drawableComponent.assets.textures;
            private _vertexAttributes : Record<string, any> = drawableComponent.vertexAttributes!
            private _billboard = drawableComponent.billboard;

            public zorder: number = drawableComponent.layer;

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

                    for(const textureOffset in this._textures) {
                        const texturePath = this._textures[textureOffset];
                        gl.activeTexture(gl.TEXTURE0 + parseInt(textureOffset));
                        gl.bindTexture(gl.TEXTURE_2D, textureCache.get(texturePath)!.glTexture);
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
                const cameraPosLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'uCameraData.position');
                const cameraForwardLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'uCameraData.forward');


                // TODO: Move it out of here.
                const invertedViewMatrix = mat4.invert(mat4.create(), camera.viewTransform);
                const cameraPosition = mat4.getTranslation(vec3.create(), invertedViewMatrix);
                const cameraForward = vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, -1, 0), invertedViewMatrix);
                const cameraForward3 = vec3.fromValues(cameraForward[0], cameraForward[1], cameraForward[2]);

                if (this._billboard) {
                    // Off the grid uniform for transform. Just to do billboarding... Need to figure it out finally.
                    const transformLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'uObjectData.transform');
                    // TODO: I need to either expose it more cleanly, or push basic object properties to shared struct.
                    const objectTransform = this._uniformAttributes['mat4']['uObjectData.transform'];
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
                // debugger;
                //canvas.glContext.blendFunc(canvas.glContext.SRC_ALPHA, canvas.glContext.ONE); // Additive blending.
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // real transparency
                // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
                gl.drawElements(gl.TRIANGLES, this._mesh!.elementsCount, gl.UNSIGNED_SHORT, 0);
            }
        }

        const request = new DrawStuff();
        newToDraw.set(drawableId, request);

    }
    
    // grab camera (just pick last)
    if (world.camera !== undefined) {
        const cameraComponent = world.camera[Object.keys(world.camera)[Object.keys(world.camera).length - 1]];
        camera = new RawCamera(mat4.copy(mat4.create(), Float32Array.from(cameraComponent.transform)), mat4.copy(mat4.create(), Float32Array.from(cameraComponent.projection)));
    }

    entitiesToDraw = newToDraw;

    // TODO: Don't sort it each frame...
    new Map([...entitiesToDraw].sort((lhs, rhs): number => {
        return  -(rhs[1].zorder - lhs[1].zorder)
    })).forEach((request, name) => {
        canvas.requestDraw(request);
    });

    //await sleep(16);
    // canvas.requestDraw(Layer.Background, squareDraw);
    if (camera !== undefined) {
        canvas.executeDraw(camera);
    }
    // requestAnimationFrame(render);
}


ws.onmessage = function(e) {
    const serverResponse = JSON.parse(e.data) as ServerResponse;

    switch(serverResponse.type) {
        case ServerResponseType.GameUpdate:
            {
                const response = serverResponse as GameUpdateResponse;
                const world = response.data;
                if (world) {
                    render(world)
                }
                break;
            }
        
        case ServerResponseType.GamePreparation:
            {
                const response = serverResponse as GamePreparationResponse;
                if (response.requiredAssetsPath) {
                    // TODO: use path it's provided.
                    fetchAssetPackage(response.requiredAssetsPath, () => {
                        const request = new GamePreparationRequest();
                        request.assetsReady = assetsLoaded;
                        ws.send(JSON.stringify(request));
                    });
                }
                break;
            }
    }
}
// requestAnimationFrame(render);


