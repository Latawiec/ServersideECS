
varying lowp vec2 vUvCoord;

struct Object {
    highp mat4 transform;
    lowp float opacity;
    lowp float size;
    sampler2D  texSampler;
    mediump ivec2 spriteSize;
    mediump ivec2 selection;
};

uniform Object uObjectData;

void main(void) {
    lowp vec2 spriteSizeFloat = vec2(uObjectData.spriteSize);
    lowp vec2 selectionFloat = vec2(uObjectData.selection);
    lowp vec2 spriteUv = vUvCoord / spriteSizeFloat + selectionFloat / spriteSizeFloat;
    lowp vec4 color = texture2D(uObjectData.texSampler, spriteUv);
    gl_FragColor = color;
}