
varying lowp vec2 vUvCoord;

struct Object {
    highp mat4 transform;
    lowp float opacity;
    lowp float size;
    sampler2D  texSampler;
    lowp vec2 uvScale;
    lowp vec2 uvOffset;
};

uniform Object uObjectData;

void main(void) {
    lowp vec4 texColor = texture2D(uObjectData.texSampler, fract(uObjectData.uvScale * vUvCoord + uObjectData.uvOffset));
    gl_FragColor = vec4(texColor.rgb, texColor.a * uObjectData.opacity);
}