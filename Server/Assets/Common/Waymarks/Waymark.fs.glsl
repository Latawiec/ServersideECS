
varying lowp vec2 vUvCoord;

struct Object {
    highp mat4 transform;
    lowp float opacity;
    lowp vec3  color;
};

uniform Object uObjectData;

const lowp vec3  glowHueShift = vec3(1.0, 1.0, 1.2);
const lowp vec3  outlineHueOffset = vec3(0.1, 0.2, -0.2);
const lowp float glowOpacityMultiplier = 0.65;
const lowp float glowInstensityOffset = 0.4;
const lowp float sharpLineWidth = 0.02;
const lowp float outlineBackfallWidth = 0.03;
const lowp float innerCircleRadius = 0.7;

const lowp float outlineIntensityMultiplier = 0.75; 
const lowp float outlineBackfallIntensityMultiplier = 0.5;


void main(void) {
    lowp float cDist = length(vUvCoord);
    lowp float cDistReverse = 1.0 - cDist;

    lowp float outterCircleMask = ceil(cDistReverse);
    lowp float innerCircleMask = smoothstep(0.98, 1.0, cDistReverse + innerCircleRadius);
    lowp float innerCircleMaskOffset = smoothstep(0.98, 1.0, cDistReverse + innerCircleRadius + sharpLineWidth);
    lowp float outsideRingMask = outterCircleMask - innerCircleMask;

    lowp float glowIntensity = smoothstep(glowInstensityOffset, 1.0, clamp(cDistReverse + glowInstensityOffset, 0.0, 1.0)) * glowOpacityMultiplier;
    lowp float outlineIntensity = smoothstep(0.75, 1.0, cDistReverse + innerCircleRadius) * outsideRingMask * outlineIntensityMultiplier;
    lowp float outlineBackfallIntensity = smoothstep(1.0 - outlineBackfallWidth, 1.0, cDist + (1.0 - innerCircleRadius)) * innerCircleMaskOffset * outlineBackfallIntensityMultiplier;

    lowp vec4 glowColor = vec4(uObjectData.color * mix(glowHueShift, vec3(1.0), cDistReverse), glowIntensity);
    lowp vec4 outlineColor = vec4(uObjectData.color + outlineHueOffset, outlineIntensity);
    lowp vec4 outlineBackfallColor = vec4(uObjectData.color + outlineHueOffset, outlineBackfallIntensity);

    lowp vec4 outputColor = glowColor
        + vec4(outlineColor.rgb * outlineColor.a, outlineColor.a)
        + vec4(outlineBackfallColor.rgb * outlineBackfallColor.a, outlineBackfallColor.a)
    ;

    gl_FragColor = vec4(outputColor.rgb, outputColor.a);
} 