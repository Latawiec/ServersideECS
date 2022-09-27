
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
    mediump ivec2 spriteSize;
    mediump ivec2 selection;
};


uniform Camera uCameraData;
uniform Object uObjectData;

varying lowp vec2 vUvCoord;

void main(void) {
    lowp vec4 objectTranslation = uObjectData.transform * vec4(0, 0, 0, 1);

    lowp vec3 zVector = normalize(-uCameraData.forward);
    lowp vec3 rVector = normalize(cross(zVector.xyz, vec3(0, 1, 0)));
    lowp vec3 uVector = normalize(cross(rVector, zVector));

    lowp mat4 billboard = mat4(
        vec4(rVector, 0),
        vec4(uVector, 0),
        vec4(zVector, 0),
        vec4(objectTranslation.xyz, 1)
    );

    gl_Position = uCameraData.proj * uCameraData.view * billboard * vec4(uObjectData.size * aVertexPosition.xyz, 1);
    vUvCoord = aUvCoord.xy;
}