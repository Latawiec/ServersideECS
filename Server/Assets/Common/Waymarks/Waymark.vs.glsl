
attribute vec4 aVertexPosition;
attribute vec2 aUvCoord;

struct Camera {
    mat4 view;
    mat4 proj;
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