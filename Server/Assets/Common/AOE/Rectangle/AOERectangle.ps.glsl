
varying lowp vec4 vColor;
varying lowp vec2 vVertexPosition;
varying lowp float vTime;

void main(void) {
    lowp float cDist = max(abs(vVertexPosition.x), abs(vVertexPosition.y));
    lowp float cDistReverse = 1.0 - cDist;
    lowp float edge = smoothstep(1.04, 0.98, cDistReverse + 0.98);
    lowp float pulse = smoothstep(0.2, 0.0, fract(cDistReverse + vTime * 1.0) + 0.08) * 0.9;
    lowp float bias = 0.75;
    lowp float edgeFade = smoothstep(0.98, 1.04, cDistReverse + 0.98);
    lowp float colorWeight = edge + pulse + bias;
    lowp float alpha = (edge + bias) * edgeFade;
    gl_FragColor = vec4((edge + bias) * 0.75 + pulse * 0.95, (edge + bias) * 0.25 + pulse * 0.10 , colorWeight * 0.0, alpha );
}