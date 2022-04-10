"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShaderProgram = exports.Shader = exports.ShaderType = void 0;
const assert_1 = require("assert");
var ShaderType;
(function (ShaderType) {
    ShaderType[ShaderType["PIXEL"] = WebGLRenderingContext.FRAGMENT_SHADER] = "PIXEL";
    ShaderType[ShaderType["VERTEX"] = WebGL2RenderingContext.VERTEX_SHADER] = "VERTEX";
})(ShaderType = exports.ShaderType || (exports.ShaderType = {}));
;
class Shader {
    constructor(gl, type, source) {
        this._gl = gl;
        this._type = type;
        this._shader = this.compileShader(this._gl, source);
    }
    release() {
        this._gl.deleteShader(this._shader);
    }
    get type() {
        return this._type;
    }
    get glShader() {
        return this._shader;
    }
    compileShader(gl, source) {
        const shader = gl.createShader(this._type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Failed to compile shader: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return undefined;
        }
        return shader;
    }
}
exports.Shader = Shader;
;
class ShaderProgram {
    constructor(gl, pixelShader, vertexShader) {
        (0, assert_1.strict)(pixelShader.type === ShaderType.PIXEL);
        (0, assert_1.strict)(vertexShader.type === ShaderType.VERTEX);
        this._gl = gl;
        this._shaderProgram = this.linkProgram(pixelShader.glShader, vertexShader.glShader);
    }
    get glShaderProgram() {
        return this._shaderProgram;
    }
    linkProgram(ps, vs) {
        const shaderProgram = this._gl.createProgram();
        this._gl.attachShader(shaderProgram, vs);
        this._gl.attachShader(shaderProgram, ps);
        this._gl.linkProgram(shaderProgram);
        if (!this._gl.getProgramParameter(shaderProgram, this._gl.LINK_STATUS)) {
            alert('Failed to link program: ' + this._gl.getProgramInfoLog(shaderProgram));
            return undefined;
        }
        return shaderProgram;
    }
}
exports.ShaderProgram = ShaderProgram;
;
