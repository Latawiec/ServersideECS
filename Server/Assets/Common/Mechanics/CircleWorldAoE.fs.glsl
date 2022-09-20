
varying lowp vec2 vVertexPosition;

struct Time {
    highp float globalTime;
};

struct Object {
    highp mat4 transform;
    lowp float radius;
    lowp float opacity;
    lowp float intensity;
};

uniform Time uTimeData;
uniform Object uObjectData;

void main(void) {
    highp float seconds = uTimeData.globalTime / 1000.0;
    lowp float cDist = length(vVertexPosition);
    lowp float cDistReverse = 1.0 - cDist;

    lowp float inside = ceil(cDistReverse);
    lowp float edgeShort = smoothstep(0.95, 1.02, cDist);
    lowp float edgeLong = smoothstep(0.8, 1.1, cDist);
    lowp float pulse = smoothstep(0.2, 0.0, fract(cDistReverse + fract(seconds)) + 0.08) * 0.9;

    lowp vec4 baseColor = vec4(0.94, 0.57, 0.3, uObjectData.intensity);
    lowp vec4 pulseColor = vec4(0.94, 0.4, 0.2, pulse * 0.8);
    lowp vec4 edgeLongColor = vec4(1.0, 0.0, 0.25, edgeLong * 0.4 );
    lowp vec4 edgeShortColor = vec4(0.9, 0.8, 0.5, edgeShort * 0.7 );

    lowp vec4 outputColor = baseColor
        + vec4(pulseColor.rgb * pulseColor.a, pulseColor.a)
        + vec4(edgeLongColor.rgb * edgeLongColor.a, edgeLongColor.a)
        + vec4(edgeShortColor.rgb * edgeShortColor.a, edgeShortColor.a)
        ;

    gl_FragColor = vec4(outputColor.rgb, outputColor.a * inside * uObjectData.opacity);
} 