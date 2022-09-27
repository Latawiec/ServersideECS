
attribute vec4 aVertexPosition;
attribute vec2 aUvCoord;

struct Camera {
    lowp mat4 view;
    lowp mat4 proj;
    lowp vec3 position;
    lowp vec3 forward;
};

struct Object {
    highp mat4 transform;
    lowp float opacity;
    lowp vec3  color;
};

uniform Camera uCameraData;
uniform Object uObjectData;

varying lowp vec2 vUvCoord;

void main(void) {
    gl_Position = uCameraData.proj * uCameraData.view * uObjectData.transform * vec4(aVertexPosition.xyz, 1);
    vUvCoord = 2.0 * aUvCoord.xy - 1.0;
}