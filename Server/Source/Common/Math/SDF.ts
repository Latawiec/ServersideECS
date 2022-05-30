import { ReadonlyVec3, vec3 } from "gl-matrix"

export namespace SDF {

    
    function vec3abs(out: vec3, a: ReadonlyVec3): vec3 {
        out = vec3.fromValues(Math.abs(a[0]), Math.abs(a[1]),  Math.abs(a[2]));
        return out;
    }
    
    function vec3maxcomp(a: ReadonlyVec3): number {
        return Math.max(Math.max(a[1], a[2]), a[3]);
    }


    // The box is NOT rotated yet... But should be simple to pass the point in transformed space to have axis-aligned box.
    // I'll have to test at what level I should do it.
    function BoxSDF(point: Readonly<vec3>, boxCenter: Readonly<vec3>, boxDimensions: Readonly<vec3>):  number {
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
        
        return distance;
    }
}