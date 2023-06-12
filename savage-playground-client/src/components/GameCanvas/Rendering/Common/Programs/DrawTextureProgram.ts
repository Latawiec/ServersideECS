import { ShaderProgram } from "@/components/GameCanvas/Assets/Commited/ProgramStorage";
import { ScreenSpaceRectangle } from "../Shapes/SceenSpaceRectangle";
import { Shader, ShaderType } from "@/components/GameCanvas/Assets/Commited/ShaderStorage";

export class DrawTextureProgram {
    private static ScreenDrawVertexShader = `
    attribute vec4 aVertexPosition;
    attribute vec2 aUvCoord;

    varying lowp vec2 vUvCoord;

    void main(void) {
        gl_Position = vec4(aVertexPosition.xyz, 1);
        vUvCoord = aUvCoord.xy;
    }
    `;
    
    private static ScreenDrawPixelShader = `
    varying lowp vec2 vUvCoord;
    uniform sampler2D uTexture;
    void main(void) {
        gl_FragColor = texture2D(uTexture, vUvCoord);
    }
    `;

    private gl: WebGLRenderingContext;
    private program: ShaderProgram;
    private vertexBuffer: WebGLBuffer;
    private indexBuffer: WebGLBuffer;
    private uvBuffer: WebGLBuffer;

    private vertexPositionAttribLoc: number;
    private uvCoordAttribLoc: number;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        const screenDrawMesh = new ScreenSpaceRectangle();

        const vertexShader = new Shader(gl, ShaderType.VERTEX, 0, DrawTextureProgram.ScreenDrawVertexShader);
        const pixelShader = new Shader(gl, ShaderType.PIXEL, 0, DrawTextureProgram.ScreenDrawPixelShader);
        this.program = new ShaderProgram(gl, pixelShader, vertexShader);

        this.vertexBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, screenDrawMesh.vertices, gl.STATIC_DRAW);

        this.uvBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, screenDrawMesh.uvs, gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, screenDrawMesh.indices, gl.STATIC_DRAW);

        this.vertexPositionAttribLoc = gl.getAttribLocation(this.program.glShaderProgram, "aVertexPosition");
        this.uvCoordAttribLoc = gl.getAttribLocation(this.program.glShaderProgram, "aUvCoord");
    }

    use() {
        const gl = this.gl;

        gl.useProgram(this.program.glShaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.vertexPositionAttribLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vertexPositionAttribLoc);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(this.uvCoordAttribLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.uvCoordAttribLoc);

        gl.activeTexture(gl.TEXTURE0);
    }

    draw(texture: Readonly<WebGLTexture>) {
        const gl = this.gl;

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
}