
attribute vec4 aVertexPosition;
attribute vec2 aUvCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec4 uColor;
uniform float uTime;

varying lowp vec4 vColor;
varying lowp vec2 vUvCoord;
varying lowp float vTime;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition.xyz, 1);
    vColor = uColor;
    vTime = uTime;
    vUvCoord = 2.0 * aUvCoord.xy - 1.0;
}