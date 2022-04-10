import { PerspectiveCamera } from "./Rendering/Basic/Camera";
import { CommonShapes } from "./Rendering/Basic/CommonShapes";
import { Layer, Canvas, DrawRequest } from "./Rendering/Canvas";
import { Shader, ShaderProgram, ShaderType } from "./Rendering/Materials/ShaderProgram";
import { mat4, vec4, vec3 } from "gl-matrix";
import { send } from "process";


console.log(location.host);
const ws = new WebSocket('ws://' + location.host);

ws.onopen = function() {
    console.log('WebSocketClient Connected');
    //ws.send('Hi this is web client.');
}

ws.onmessage = function(e) {
    console.log ('Received: %s', e.data);
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

class DrawSquareRequest implements DrawRequest {
    private _gl: WebGLRenderingContext;
    private _vertexBuffer: WebGLBuffer;
    private _indexBuffer: WebGLBuffer;
    private _elementsCount: number;
    private _shaderProgram: ShaderProgram;
    private _transform: mat4 = mat4.create();
    private _color: vec4 = vec4.create();

    private vertexShaderCode: string = `
        attribute vec4 aVertexPosition;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        uniform vec4 uColor;

        varying lowp vec4 vColor;

        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition.xyz, 1);
            vColor = uColor;
        }
    `;
    private pixelShaderCode: string = `
        varying lowp vec4 vColor;

        void main(void) {
            gl_FragColor = vColor;
        }
    `;

    constructor(glContext: WebGLRenderingContext) {
        this._gl = glContext

        const squareMesh = new CommonShapes.Square();
        this._elementsCount = squareMesh.indices.length;
        this._vertexBuffer = glContext.createBuffer()!;
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this._vertexBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, squareMesh.vertices, glContext.STATIC_DRAW);

        this._indexBuffer = glContext.createBuffer()!;
        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, squareMesh.indices, glContext.STATIC_DRAW);

        const pixelShader = new Shader(glContext, ShaderType.PIXEL, this.pixelShaderCode);
        const vertexShader = new Shader(glContext, ShaderType.VERTEX, this.vertexShaderCode);
        
        this._shaderProgram = new ShaderProgram(glContext, pixelShader, vertexShader);

        this._color = [Math.random(), Math.random(), Math.random(), 1.0];
    }

    draw(): void {
        const gl = this._gl;
        
        const vertexPositionAttribLoc = gl.getAttribLocation(this._shaderProgram.glShaderProgram, 'aVertexPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.vertexAttribPointer(
            vertexPositionAttribLoc,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );
        gl.enableVertexAttribArray(vertexPositionAttribLoc);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.useProgram(this._shaderProgram.glShaderProgram);

        const projectionMatrixUniformLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'uProjectionMatrix');
        const modelViewMatrixUniformLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'uModelViewMatrix');
        const colorUniformLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'uColor');

        let dateTime = new Date();
        var ms = dateTime.getMilliseconds();
        const view = mat4.create();
        mat4.lookAt(view, [0, 0., -9], [0, 0, 0.0], [0, 1, 0]);
        const model = this._transform;
        const viewModel = mat4.create();

        mat4.multiply(viewModel, view, model);

        const identity = mat4.create();
        mat4.identity(identity);
        const translated = mat4.create();
        // mat4.translate(translated, identity, [-0.0, 1.0, 0.0]);
        
        gl.uniformMatrix4fv(
            modelViewMatrixUniformLoc,
            false,
            viewModel
        );

        gl.uniformMatrix4fv(
            projectionMatrixUniformLoc,
            false,
            camera.transform
        );

        gl.uniform4fv(
            colorUniformLoc,
            this._color
        );

        gl.drawElements(gl.TRIANGLES, this._elementsCount, gl.UNSIGNED_SHORT, 0);
    }

    set transform(newTransform: mat4) {
        this._transform = newTransform;
    } 
}

const squareDraw = new DrawSquareRequest(canvas.glContext);


const sleep = async (ms: number) => new Promise(r => setTimeout(r, ms));
var entitiesToDraw = new Map<string, DrawSquareRequest>();

async function render() {
    var xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open("GET", "/world", false);
    xmlHTTP.send(null);

    const world = JSON.parse(xmlHTTP.responseText);

    // We'll be swaping DrawRequests and asigning to currently existing names lol. Kinda makes it easier to implement.
    const newToDraw = new Map<string, DrawSquareRequest>();
    world.entities?.forEach((entity: any) => {
        const name: string = entity.components.playerIdentity?.name;
        const transform: vec3 = entity.components.transform;
        if (name) {
            const request = entitiesToDraw.has(name) ? entitiesToDraw.get(name)! : new DrawSquareRequest(canvas.glContext);
            const newTransform = mat4.create();
            mat4.translate(newTransform, newTransform, transform);
            request.transform = newTransform;
            newToDraw.set(name, request);
        }
    });

    entitiesToDraw = newToDraw;

    entitiesToDraw.forEach((request, name) => {
        canvas.requestDraw(Layer.Foreground, request);
    });

    //await sleep(16);
    // canvas.requestDraw(Layer.Background, squareDraw);
    canvas.executeDraw();
    requestAnimationFrame(render);
}


requestAnimationFrame(render);