import { PerspectiveCamera } from "./Rendering/Basic/Camera";
import { DrawSquareRequest } from "./DrawSquareRequest";
import { Layer, Canvas, DrawRequest } from "./Rendering/Canvas";
import { Shader, ShaderProgram, ShaderType } from "./Rendering/Materials/ShaderProgram";
import { mat4, vec4, vec3, vec2 } from "gl-matrix";
import { send } from "process";
import { DrawSpriteSegmentRequest } from "./DrawSpriteSegmentRequest";
import PNG from 'png-ts';


console.log(location.host);
const ws = new WebSocket('ws://' + location.host);

function httpGet(theUrl: string)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, true ); // false for synchronous request
    xmlHttp.responseType = "arraybuffer";
    xmlHttp.onload = function() {
        var arrayBuffer = xmlHttp.response;
        console.log(arrayBuffer);
        var byteArray = new Uint8Array(arrayBuffer);
        console.log(byteArray);
        const tmp = PNG.load(byteArray);
        console.log(tmp);
        redMage = tmp.decodePixels();
        redMageDim = [tmp.width, tmp.height];
    }
    xmlHttp.send( null );
}

let redMage: Uint8Array;
let redMageDim = [1, 1];

ws.onopen = function() {
    console.log('WebSocketClient Connected');
    //ws.send('Hi this is web client.');
    httpGet("asset?path=WOL/RedMage.png");
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



const squareDraw = new DrawSquareRequest(canvas.glContext);
const spriteDraw = new DrawSpriteSegmentRequest(canvas.glContext, new Uint8Array([1, 1, 1]), 1, 1);

const sleep = async (ms: number) => new Promise(r => setTimeout(r, ms));
var entitiesToDraw = new Map<string, DrawRequest>();

async function render(world: any) {

    // We'll be swaping DrawRequests and asigning to currently existing names lol. Kinda makes it easier to implement.
    const newToDraw = new Map<string, DrawRequest>();
    world.entities?.forEach((entity: any) => {
        const name: string = entity.components.playerIdentity?.name;
        const transform: vec3 = entity.components.transform;
        if (name) {
            let request: DrawRequest;
            const type: number = entity.components.drawing?.type;

            if (entitiesToDraw.has(name)) 
            {
                request = entitiesToDraw.get(name)!;
            } else {
                if (type === 1)
                {
                    request = new DrawSpriteSegmentRequest(canvas.glContext, redMage, redMageDim[0], redMageDim[1]);
                } else {
                    request = new DrawSquareRequest(canvas.glContext);
                }
            }

            // TODO: Get rid of this type-specific thing. Disgusting.
            if (type === 0) {
                let squareRequest = request as DrawSquareRequest;
                const newTransform = mat4.create();
                mat4.translate(newTransform, newTransform, transform);
                squareRequest.transform = newTransform;
            } else
            if (type === 1) {
                let spriteRequest = request as DrawSpriteSegmentRequest;
                const spriteSelect = entity.components.drawing!.selectedSegment;
                const newTransform = mat4.create();
                mat4.translate(newTransform, newTransform, transform);
                spriteRequest.transform = newTransform;
                spriteRequest.spriteSelect = vec2.fromValues(spriteSelect[0], spriteSelect[1]);
                console.log("width: %d height: %d", spriteSelect[0], spriteSelect[1]);
                newToDraw.set(name, spriteRequest);
            }
            newToDraw.set(name, request);
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
    console.log("Got: " + e.data);
    const worldMostLikely = JSON.parse(e.data);
    render(worldMostLikely);
}

// requestAnimationFrame(render);

