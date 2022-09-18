
varying lowp vec2 vVertexPosition;

struct Time {
    highp float globalTime;
};

struct Object {
    highp mat4 transform;
    lowp float radius;
    lowp float opacity;
};

uniform Time uTimeData;
uniform Object uObjectData;

void main(void) {
    highp float seconds = uTimeData.globalTime / 1000.0;
    lowp float cDist = length(vVertexPosition);
    lowp float cDistReverse = 1.0 - cDist;
    lowp float edge = smoothstep(1.04, 0.98, cDistReverse + 0.98);
    lowp float pulse = smoothstep(0.2, 0.0, fract(cDistReverse + fract(seconds) * 1.0) + 0.08) * 0.9;
    lowp float bias = 0.75;
    lowp float edgeFade = smoothstep(0.98, 1.04, cDistReverse + 0.98);
    lowp float colorWeight = edge + pulse + bias;
    lowp float alpha = (edge + bias) * edgeFade;
    gl_FragColor = uObjectData.opacity * uObjectData.opacity * vec4((edge + bias) * 0.75 + pulse * 0.95, (edge + bias) * 0.25 + pulse * 0.10 , colorWeight * 0.0, alpha );
}