
attribute vec4 aVertexPosition;

struct Camera {
    mat4 view;
    mat4 proj;
};

struct Object {
    mat4 transform;
    lowp float width;
    lowp float height;
    lowp float opacity;
};

struct Time {
    lowp float globalTime;
};

uniform Camera uCameraData;
uniform Object uObjectData;
uniform Time   uTimeData;

varying lowp vec2 vVertexPosition;

void main(void) {
    gl_Position = uCameraData.proj * uCameraData.view * uObjectData.transform * vec4(aVertexPosition.xyz, 1);
    vVertexPosition = aVertexPosition.xy;
}