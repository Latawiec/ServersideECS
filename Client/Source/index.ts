import { PerspectiveCamera } from "./Rendering/Basic/Camera";
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


console.log(location.host);
const ws = new WebSocket('ws://' + location.host);

function getAsset(assetPath: string, onReceive: (data: Readonly<Uint8Array>) => void)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "asset?path=" + assetPath, true );
    xmlHttp.responseType = "arraybuffer";
    xmlHttp.onload = function() {
        var arrayBuffer = xmlHttp.response;
        var byteArray = new Uint8Array(arrayBuffer);
        onReceive(byteArray);
    }
    xmlHttp.send(null);
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

const camera = new PerspectiveCamera(
    45.0 * Math.PI / 180.0,
    canvas.width/canvas.height,
    0.1,
    100.0);


const sleep = async (ms: number) => new Promise(r => setTimeout(r, ms));
var entitiesToDraw = new Map<string, DrawRequest>();
var awaitedDrawRequests = new Map<string, DrawRequest | undefined>();

// Test Alpha Blend.
canvas.glContext.enable(canvas.glContext.BLEND);
canvas.glContext.blendFunc(canvas.glContext.SRC_ALPHA, canvas.glContext.ONE_MINUS_SRC_ALPHA);

async function render(world: any) {

    // We'll be swaping DrawRequests and asigning to currently existing names lol. Kinda makes it easier to implement.
    const newToDraw = new Map<string, DrawRequest>();
    world.entities?.forEach((entity: any) => {
        const name: string = entity.name;
        var transform: mat4 = entity.components.transform;

        if (entity.components.drawing !== undefined) {
            let request: DrawRequest;
            const drawComponent = entity.components.drawing;
            if (drawComponent.transform) {
                transform = drawComponent.transform;
            }
            const assetPaths = drawComponent.assetPaths as Array<string>;
            const type: number = entity.components.drawing?.type;

            if (entitiesToDraw.has(name)) 
            {
                const request = entitiesToDraw.get(name)!;
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
                newToDraw.set(name, request);
                return;
            } else {
                console.log("Doesn't have: " + name);
            }

            if (awaitedDrawRequests.has(name))
            {
                if (awaitedDrawRequests.get(name) != undefined) {
                    newToDraw.set(name, awaitedDrawRequests.get(name)!);
                    awaitedDrawRequests.delete(name);
                }
                return;
            }

            // Create new draw request. Such object hasn't been registered for drawing yet.
            if (type == 0) {
                if (assetPaths.length > 0 && assetPaths[0] != "") {
                    awaitedDrawRequests.set(name, undefined);
                    getAsset(assetPaths[0], (data) => {
                        const image = pngDecode(data);
                        const texturedSquareRequest = new DrawTextureSquareRequest(canvas.glContext, image.data, image.width, image.height);
                        texturedSquareRequest.transform = transform;
                        awaitedDrawRequests.set(name, texturedSquareRequest);
                    });
                    return;
                } else {
                    const plainSquareRequest = new DrawSquareRequest(canvas.glContext);
                    plainSquareRequest.transform = transform;

                    newToDraw.set(name, plainSquareRequest);
                    return;
                }
            } else 
            if (type == 1) {
                if (assetPaths.length > 0 && assetPaths[0] != "") {
                    awaitedDrawRequests.set(name, undefined);
                    getAsset(assetPaths[0], (data) => {
                        const image = pngDecode(data);
                        const spriteRequest = new DrawSpriteSegmentRequest(canvas.glContext, image.data, image.width, image.height);
                        const spriteSelect = entity.components.drawing!.selectedSegment;
                        spriteRequest.transform = transform;
                        spriteRequest.spriteSelect = vec2.fromValues(spriteSelect[0], spriteSelect[1]);
                        awaitedDrawRequests.set(name, spriteRequest);
                    });
                    return;
                }
            } else 
            if (type == 2) {
                const aoeCircleRequest = new DrawCircleAoeRequest(canvas.glContext);
                aoeCircleRequest.transform = transform;
                newToDraw.set(name, aoeCircleRequest);
                return;
            } else
            if (type == 3) {
                console.log("Got 3");
                const aoeRectangleRequest = new DrawRectangleAoeRequest(canvas.glContext);
                aoeRectangleRequest.transform = transform;
                newToDraw.set(name, aoeRectangleRequest);
                return;
            }
        }
    });

    entitiesToDraw = newToDraw;

    entitiesToDraw.forEach((request, name) => {
        canvas.requestDraw(Layer.Foreground, request);
    });

    //await sleep(16);
    // canvas.requestDraw(Layer.Background, squareDraw);
    canvas.executeDraw(camera);
    // requestAnimationFrame(render);
}

ws.onmessage = function(e) {
    // console.log("Got: " + e.data);
    const worldMostLikely = JSON.parse(e.data);
    render(worldMostLikely);
}

// requestAnimationFrame(render);

