import { Layer, Canvas, DrawRequest } from "./Rendering/Canvas";
import { Shader, ShaderProgram, ShaderType } from "./Rendering/Materials/ShaderProgram";
import { mat4, vec4, vec3, vec2 } from "gl-matrix";
import { CommonShapes } from "./Rendering/Basic/CommonShapes";
import { Camera } from "./Rendering/Basic/Camera";
import { throws } from "assert";

export class DrawSpriteSegmentRequest implements DrawRequest {
    private _gl: WebGLRenderingContext;
    private _vertexBuffer: WebGLBuffer;
    private _indexBuffer: WebGLBuffer;
    private _uvBuffer: WebGLBuffer;
    private _elementsCount: number;
    private _shaderProgram: ShaderProgram;
    private _transform: mat4 = mat4.create();
    private _color: vec4 = vec4.create();
    private _texture: WebGLTexture;
    private _spriteSelect: vec2 = vec2.create();
    private _spriteSegments: vec2 = vec2.fromValues(2, 2);

    private vertexShaderCode: string = `
        attribute vec4 aVertexPosition;
        attribute vec2 aTextureCoord;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        uniform vec4 uColor;

        varying lowp vec4 vColor;
        varying highp vec2 uvCoord;

        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition.xyz, 1);
            vColor = uColor;
            uvCoord = aTextureCoord;
        }
    `;
    private pixelShaderCode: string = `
        varying lowp vec4 vColor;
        varying highp vec2 uvCoord;
    
        struct SpriteData {
            sampler2D texSampler;
            ivec2 spriteSegments;
            ivec2 selectionOffset;
        };
        uniform SpriteData sprite;

        void main(void) {
            lowp vec2 spriteUv = uvCoord / vec2(sprite.spriteSegments) + vec2(sprite.selectionOffset) / vec2(sprite.spriteSegments);
            highp vec4 color = texture2D(sprite.texSampler, spriteUv);

            if (color.a != 1.0) discard;
            gl_FragColor = color;
        }
    `;

    constructor(glContext: WebGLRenderingContext, textureData: Uint8Array, width: number, height: number) {
        this._gl = glContext

        const squareMesh = new CommonShapes.Square();
        this._elementsCount = squareMesh.indices.length;
        this._vertexBuffer = glContext.createBuffer()!;
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this._vertexBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, squareMesh.vertices, glContext.STATIC_DRAW);

        this._indexBuffer = glContext.createBuffer()!;
        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, squareMesh.indices, glContext.STATIC_DRAW);

        this._uvBuffer = glContext.createBuffer()!;
        glContext.bindBuffer(glContext.ARRAY_BUFFER, this._uvBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, squareMesh.uv, glContext.STATIC_DRAW);
        
        const pixelShader = new Shader(glContext, ShaderType.PIXEL, this.pixelShaderCode);
        const vertexShader = new Shader(glContext, ShaderType.VERTEX, this.vertexShaderCode);
        
        this._shaderProgram = new ShaderProgram(glContext, pixelShader, vertexShader);

        this._texture = glContext.createTexture()!;
        glContext.bindTexture(glContext.TEXTURE_2D, this._texture);
        glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, width, height, 0, glContext.RGBA, glContext.UNSIGNED_BYTE, textureData);
        console.log("width: %d, height: %d", width, height);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, glContext.NEAREST);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.NEAREST);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);
        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);

        this._color = [Math.random(), Math.random(), Math.random(), 1.0];
    }

    draw(camera: Readonly<Camera>): void {
        const gl = this._gl;
        
        const vertexPositionAttribLoc = gl.getAttribLocation(this._shaderProgram.glShaderProgram, 'aVertexPosition');
        const uvCoordAttribLoc        = gl.getAttribLocation(this._shaderProgram.glShaderProgram, 'aTextureCoord');
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.enableVertexAttribArray(vertexPositionAttribLoc);
        gl.vertexAttribPointer(
            vertexPositionAttribLoc,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
        gl.enableVertexAttribArray(uvCoordAttribLoc);
        gl.vertexAttribPointer(
            uvCoordAttribLoc,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.useProgram(this._shaderProgram.glShaderProgram);

        const projectionMatrixUniformLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'uProjectionMatrix');
        const modelViewMatrixUniformLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'uModelViewMatrix');
        const colorUniformLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'uColor');
        const textureSamplerUniformLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'sprite.texSampler');
        const spriteSegmentsUniformLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'sprite.spriteSegments');
        const selectionOffsetUniformLoc = gl.getUniformLocation(this._shaderProgram.glShaderProgram, 'sprite.selectionOffset');

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

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.uniform1i(textureSamplerUniformLoc, 0);

        gl.uniform2i(
            spriteSegmentsUniformLoc,
            this._spriteSegments[0],
            this._spriteSegments[1]
        );

        gl.uniform2i(
            selectionOffsetUniformLoc,
            this._spriteSelect[0],
            this._spriteSelect[1]
        );

        gl.drawElements(gl.TRIANGLES, this._elementsCount, gl.UNSIGNED_SHORT, 0);
    }

    set transform(newTransform: mat4) {
        this._transform = newTransform;
    }

    set spriteSelect(selection: vec2) {
        this._spriteSelect = vec2.fromValues(selection[0], selection[1]);
    }
}