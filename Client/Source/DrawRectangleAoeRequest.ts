import { Layer, Canvas, DrawRequest } from "./Rendering/Canvas";
import { Shader, ShaderProgram, ShaderType } from "./Rendering/Materials/ShaderProgram";
import { mat4, vec4, vec3 } from "gl-matrix";
import { CommonShapes } from "./Rendering/Basic/CommonShapes";
import { Camera } from "./Rendering/Basic/Camera";

export class DrawRectangleAoeRequest implements DrawRequest {
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
        uniform float uTime;

        varying lowp vec4 vColor;
        varying lowp vec2 vVertexPosition;
        varying lowp float vTime;

        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition.xyz, 1);
            vColor = uColor;
            vTime = uTime;
            vVertexPosition = aVertexPosition.xy;
        }
    `;
    private pixelShaderCode: string = `
        varying lowp vec4 vColor;
        varying lowp vec2 vVertexPosition;
        varying lowp float vTime;

        void main(void) {
            lowp float cDist = max(abs(vVertexPosition.x), abs(vVertexPosition.y));
            lowp float cDistReverse = 1.0 - cDist;
            lowp float edge = smoothstep(1.04, 0.98, cDistReverse + 0.98);
            lowp float pulse = smoothstep(0.2, 0.0, fract(cDistReverse + vTime * 1.0) + 0.08) * 0.9;
            lowp float bias = 0.75;
            lowp float edgeFade = smoothstep(0.98, 1.04, cDistReverse + 0.98);
            lowp float colorWeight = edge + pulse + bias;
            lowp float alpha = (edge + bias) * edgeFade;
            gl_FragColor = vec4((edge + bias) * 0.75 + pulse * 0.95, (edge + bias) * 0.25 + pulse * 0.10 , colorWeight * 0.0, alpha );
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

        this._color = [0.9, 0.2, 0, 1.0];
    }

    set color(color: Readonly<vec4>) {
        this._color = vec4.copy(vec4.create(), color);
    }

    get color() : vec4 {
        return this._color;
    }

    draw(camera: Readonly<Camera>): void {
        const gl = this._gl;
        
        const vertexPositionAttribLoc = gl.getAttribLocation(this._shaderProgram.glShaderProgram, 'aVertexPosition');
        const uvCoordAttribLoc = gl.getAttribLocation(this._shaderProgram.glShaderProgram, 'aUvCoord');
        
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
        const timeUniformLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'uTime');

        let dateTime = new Date();
        var ms = dateTime.getMilliseconds();
        const view = camera.viewTransform;
        //mat4.lookAt(view, [0, 0., -9], [0, 0, 0.0], [0, 1, 0]);
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

        gl.uniform1f(
            timeUniformLoc,
            ms
        );

        gl.drawElements(gl.TRIANGLES, this._elementsCount, gl.UNSIGNED_SHORT, 0);
    }

    set transform(newTransform: mat4) {
        this._transform = newTransform;
    } 
}