import { ReadonlyVec3, vec3, vec4, mat4 } from "gl-matrix"

export namespace SDF {

    
    function vec3abs(out: vec3, a: ReadonlyVec3): vec3 {
        out = vec3.fromValues(Math.abs(a[0]), Math.abs(a[1]),  Math.abs(a[2]));
        return out;
    }

    function vec3tovec4(inVec: vec3, isTransformable = true): vec4 {
        return vec4.fromValues(inVec[0], inVec[1], inVec[2], isTransformable ? 1 : 0);
    }

    function vec4tovec3(inVec: Readonly<vec4>): vec3 {
        return vec3.fromValues(inVec[0], inVec[1], inVec[2]);
    }

    function clamp(value: number, min: number, max: number) : number {
        return Math.min(Math.max(value, min), max);
    }

    function reflectVec3(vector: Readonly<vec3>, axis: Readonly<vec3>) : vec3 {
        const axisNorm = vec3.normalize(vec3.create(), axis);
        const projLength = vec3.dot(vector, axisNorm);
        const projection = vec3.scale(vec3.create(), axisNorm, projLength);

        const rejection = vec3.sub(vec3.create(), vector, projection);

        return vec3.subtract(vec3.create(), projection, rejection);
    }

    function vec3clampNegative(out: vec3, a: ReadonlyVec3): vec3 {
        var result = vec3.create();
        result[0] = Math.max(a[0], 0);
        result[1] = Math.max(a[1], 0);
        result[2] = Math.max(a[2], 0);
        return result;
    }

    // Creates a space transform that has box center at (0,0,0) and xyz axis are aligned with box sides.
    export function transformToBoxAlignedSpace(boxCenter: Readonly<vec3>, widthVec: Readonly<vec3>, heightVec: Readonly<vec3>, depthVec: Readonly<vec3>) : mat4 {
        
        const widthNorm = vec3.normalize(vec3.create(), widthVec);
        const heightNorm = vec3.normalize(vec3.create(), heightVec);
        const depthNorm = vec3.normalize(vec3.create(), depthVec);

        const xAxis = vec3.normalize(vec3.create(), reflectVec3(widthNorm, vec3.fromValues(1, 0, 0)));
        const yAxis = vec3.normalize(vec3.create(), reflectVec3(heightNorm, vec3.fromValues(0, 1, 0)));
        const zAxis = vec3.normalize(vec3.create(), reflectVec3(depthNorm, vec3.fromValues(0, 0, 1)));
        const qNegative = vec3.negate(vec3.create(), boxCenter );

        const xTranslate = vec3.dot(qNegative, vec3.fromValues(xAxis[0], yAxis[0], zAxis[0]));
        const yTranslate = vec3.dot(qNegative, vec3.fromValues(xAxis[1], yAxis[1], zAxis[1]));
        const zTranslate = vec3.dot(qNegative, vec3.fromValues(xAxis[2], yAxis[2], zAxis[2]));

        const transform = mat4.fromValues(
            xAxis[0],     xAxis[1],     xAxis[2],     0,
            yAxis[0],     yAxis[1],     yAxis[2],     0,
            zAxis[0],     zAxis[1],     zAxis[2],     0,
            xTranslate,   yTranslate,   zTranslate,   1
        );

        return transform;
    }

    function vec3maxcomp(a: Readonly<vec3>): number {
        return Math.max(a[0], a[1], a[2]);
    }

    function vec3mincomp(a: Readonly<vec3>): number {
        return Math.min(a[0], a[1], a[2]);
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

    export function BoxSDF(point: Readonly<vec4>, boxCenter: Readonly<vec3>, widthSpan: Readonly<vec3>, heightSpan: Readonly<vec3>, depthSpan: Readonly<vec3>) : number {
        const boxAlignedSpaceTransform = transformToBoxAlignedSpace(boxCenter, widthSpan, heightSpan, depthSpan);
        const transformedPoint = vec4.transformMat4(vec4.create(), point, boxAlignedSpaceTransform);

        const halfWidth = vec3.distance(vec3.create(), widthSpan);
        const halfHeight = vec3.distance(vec3.create(), heightSpan);
        const halfDepth = vec3.distance(vec3.create(), depthSpan);

        const dimensions = vec3.fromValues(halfWidth, halfHeight, halfDepth);

        // Outside of the box
        const absPoint = vec3abs(vec3.create(), vec4tovec3(transformedPoint));
        const distanceVector = vec3.subtract(vec3.create(), absPoint, dimensions);
        const clampedDistanceVector = vec3clampNegative(vec3.create(), distanceVector);

        const outsideDistance = vec3.distance(vec3.create(), clampedDistanceVector);
        
        // Inside of the box
        const insideDistance = Math.min(vec3maxcomp(distanceVector), 0);

        return outsideDistance + insideDistance;
    }

    export function SphereSDF(point: Readonly<vec4>, sphereCenter: Readonly<vec3>, sphereRadius: number): number {
        
        var pointToSphereCenter = vec3.create();
        vec3.sub(pointToSphereCenter, sphereCenter, vec4tovec3(point));
        const distance = vec3.length(pointToSphereCenter) - sphereRadius;
        
        return distance;
    }

    export function CapsuleSDF(point: Readonly<vec4>, capsuleBase: Readonly<vec3>, capsuleExtension: Readonly<vec3>, radius: number) : number {
        const halfExtension = vec3.scale(vec3.create(), capsuleExtension, 0.5);
        const pointFromBase = vec3.sub(vec3.create(), vec4tovec3(point), capsuleBase);
        const pointFromMiddle = vec3.sub(vec3.create(), pointFromBase, halfExtension);
        
        const extensionLength = vec3.length(capsuleExtension);
        const halfExtensionLength = extensionLength / 2.0;
        const normExtension = vec3.normalize(vec3.create(), capsuleExtension);
        const fromMiddleProjLength = vec3.dot(pointFromMiddle, normExtension);
        const fromMiddleProj = vec3.scale(vec3.create(), normExtension, fromMiddleProjLength);
        const fromMiddleReject = vec3.sub(vec3.create(), pointFromMiddle, fromMiddleProj);

        // -1 at the bottom, 1 at the top. < -1 below bottom, > 1 above top.
        const fromMiddleScaled = fromMiddleProjLength / halfExtensionLength;

        const extensionDistance = vec3.length(fromMiddleReject);
        const pointFromCap = vec3.sub(vec3.create(), pointFromMiddle, vec3.scale(vec3.create(), normExtension, Math.sign(fromMiddleProjLength) * halfExtensionLength));
        const capsDistance = vec3.length(pointFromCap);

        // 0 if point is on extension, 1 if it's on the cap.
        const capsFlag = clamp(Math.ceil(Math.abs(fromMiddleScaled) - 1), 0, 1);
        const extensionFlag = 1 - capsFlag;
        
        return extensionFlag * extensionDistance + capsFlag * capsDistance - radius;
    }

    // I don't think I need SDF for cone?
    export function ConeCollision(point: Readonly<vec4>, coneBase: Readonly<vec3>, coneDirection: Readonly<vec3>, coneHalfAngle: number) : boolean {
        const pointFromBase = vec3.sub(vec3.create(), vec4tovec3(point), coneBase);
        const coneAngleCos = Math.cos(coneHalfAngle);
        const directionNorm = vec3.normalize(vec3.create(), coneDirection);
        const coneLength = vec3.len(coneDirection);
        const pointFromBaseLength = vec3.len(pointFromBase);

        const pointDirectionProjLength = vec3.dot(pointFromBase, directionNorm);
        const pointDirectionAngleCos = pointDirectionProjLength / pointFromBaseLength;

        const distanceDiff = pointFromBaseLength - coneLength;
        const anglediff = coneAngleCos - pointDirectionAngleCos;

        return distanceDiff < 0 && anglediff < 0;
    }
}