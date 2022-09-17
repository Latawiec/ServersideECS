
attribute vec4 aVertexPosition;

struct Camera {
    mat4 modelViewMatrix;
    mat4 projectionMatrix;
};

struct Time {
    lowp float globalTime;
    lowp float animationTimeNorm; // 0 - 1
    lowp float animationDuration;
    lowp float fadeInTime;
    lowp float fadeOutTime;
};

uniform Camera uCameraData;
uniform Time   uTimeData;

varying lowp vec2 vVertexPosition;

void main(void) {
    gl_Position = uCameraData.projectionMatrix * uCameraData.modelViewMatrix * vec4(aVertexPosition.xyz, 1);
    vVertexPosition = aVertexPosition.xy;
}