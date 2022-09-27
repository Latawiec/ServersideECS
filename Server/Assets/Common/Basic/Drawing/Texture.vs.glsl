
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
    lowp float size;
    sampler2D  texSampler;
    lowp vec2 uvScale;
    lowp vec2 uvOffset;
};

uniform Camera uCameraData;
uniform Object uObjectData;

varying lowp vec2 vUvCoord;

void main(void) {
    gl_Position = uCameraData.proj * uCameraData.view * uObjectData.transform * vec4(uObjectData.size * aVertexPosition.xyz, 1);
    vUvCoord = aUvCoord.xy;
}