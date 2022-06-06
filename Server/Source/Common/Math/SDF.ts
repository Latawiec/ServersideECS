import { ReadonlyVec3, vec3, vec4 } from "gl-matrix"

export namespace SDF {

    
    function vec3abs(out: vec3, a: ReadonlyVec3): vec3 {
        out = vec3.fromValues(Math.abs(a[0]), Math.abs(a[1]),  Math.abs(a[2]));
        return out;
    }

    function vec3tovec4(inVec: vec3, isTransformable = true): vec4 {
        return vec4.fromValues(inVec[0], inVec[1], inVec[2], isTransformable ? 1 : 0);
    }   

    function clamp(value: number, min: number, max: number) : number {
        return Math.min(Math.max(value, min), max);
    }

    function vec3maxcomp(a: ReadonlyVec3): number {
        return Math.max(Math.max(a[1], a[2]), a[3]);
    }

    function PlaneSDF(point: Readonly<vec3>, plane: Readonly<vec4>): number {
        const pointVec4 = vec4.fromValues(point[0], point[1], point[2], 1.0);
        return vec4.dot(pointVec4, plane);
    }

    function ConeSDF(point: Readonly<vec3>, coneStartPoint: Readonly<vec3>, coneDirection: Readonly<vec3>, spreadRadians: number): number {
        const coneStartClamped = vec4.fromValues(coneStartPoint[0], coneStartPoint[1], 0, 1);
        const dirNorm = vec3.normalize(vec3.create(), vec3.fromValues(coneDirection[0], coneDirection[1], 0));
        const leftFromDir = vec3.fromValues(dirNorm[1], -dirNorm[0], 0);

        const halfAngleTan = Math.tan(spreadRadians/2.0);
        const leftConeDir = vec3.normalize(vec3.create(),
            vec3.add(vec3.create(), dirNorm,
                vec3.multiply(vec3.create(), leftFromDir, vec3.fromValues(halfAngleTan, halfAngleTan, halfAngleTan)
                )
            )
        );

        const leftConeNormal = vec3.normalize(vec3.create(), vec3.sub(vec3.create(), leftConeDir, dirNorm)); 
        const rightConeNormal = vec3.negate(vec3.create(), leftConeNormal);

        const leftConePlane = vec4.add(vec4.create(), vec3tovec4(leftConeNormal, false), vec4.fromValues(0, 0, 0, vec4.dot(coneStartClamped, vec3tovec4(leftConeNormal, false))));
        const rightConePlane = vec4.add(vec4.create(), vec3tovec4(rightConeNormal, false), vec4.fromValues(0, 0, 0, vec4.dot(coneStartClamped, vec3tovec4(rightConeNormal, false))));

        const distanceToLeft = vec4.dot(coneStartClamped, leftConePlane);
        const distanceToRight = vec4.dot(coneStartClamped, rightConePlane);

        // if 0, we're inside
        // if 1, we're at either of sides
        // if 2, we're at the cone vertex
        const section = Math.round(clamp(distanceToLeft, 0, 1) + clamp(distanceToRight, 0, 1));

        const distance = 
            Math.min(distanceToLeft, distanceToRight) * (section == 0 ? 1.0 : 0.0) +
            (Math.max(distanceToLeft, 0) + Math.max(distanceToRight, 0)) * (section == 1 ? 1.0 : 0.0) +
            vec3.len(vec3.sub(vec3.create(), point, coneStartPoint)) * (section == 2 ? 1.0 : 0.0);

        return distance;
    }

    // The box is NOT rotated yet... But should be simple to pass the point in transformed space to have axis-aligned box.
    // I'll have to test at what level I should do it.
    function AABoxSDF(point: Readonly<vec3>, boxCenter: Readonly<vec3>, boxDimensions: Readonly<vec3>):  number {
        var boxHalfDimensions: vec3 = vec3.create();
        vec3.div(boxHalfDimensions, boxDimensions, [2.0, 2.0, 2.0]);

        // First do the outside of the box
        var pointToBox = vec3.create();
        vec3.sub(pointToBox, point, boxCenter);
        vec3abs(pointToBox, pointToBox);
        vec3.sub(pointToBox, pointToBox, boxHalfDimensions);

        var outsideClamped = vec3.create();
        vec3.max(outsideClamped, pointToBox, [0, 0, 0]);
        var outsideDistance = vec3.length(outsideClamped);

        // Now to the inside.
        var insideDistance = Math.min(vec3maxcomp(pointToBox), 0);
        
        return outsideDistance + insideDistance;
    }

    function SphereSDF(point: Readonly<vec3>, sphereCenter: Readonly<vec3>, sphereRadius: number): number {
        var pointToSphereCenter = vec3.create();
        vec3.sub(pointToSphereCenter, sphereCenter, point);
        var distance = vec3.length(pointToSphereCenter) - sphereRadius;
        ``
        return distance;
    }
}