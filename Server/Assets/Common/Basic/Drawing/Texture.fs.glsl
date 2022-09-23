
varying lowp vec2 vUvCoord;

struct Object {
    highp mat4 transform;
    lowp float opacity;
    lowp float size;
    sampler2D  texSampler;
};

uniform Object uObjectData;

void main(void) {
    lowp vec4 texColor = texture2D(uObjectData.texSampler, vUvCoord);
    gl_FragColor = texColor;
}