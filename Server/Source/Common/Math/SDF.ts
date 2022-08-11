import { ReadonlyVec3, vec2, vec3, vec4, mat3, mat4 } from "gl-matrix"
import { vec2abs, vec3abs, vec3tovec4, vec4tovec3, vec3clampNegative, vec2clampNegative, reflectVec3, reflectVec2, vec3maxcomp, vec2maxcomp } from "./gl-extensions"

export namespace SDF {

    function clamp(value: number, min: number, max: number) : number {
        return Math.min(Math.max(value, min), max);
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

    // Same as transformToBoxAlignedSpace but 2D.
    export function transformToRectangleAlignedSpace(rectCenter: Readonly<vec2>, widthVec: Readonly<vec2>, heightVec: Readonly<vec2>) : mat3 {
        const widthNorm = vec2.normalize(vec2.create(), widthVec);
        const heightNorm = vec2.normalize(vec2.create(), heightVec);

        const xAxis = vec2.normalize(vec2.create(), reflectVec2(widthNorm, vec2.fromValues(1, 0)));
        const yAxis = vec2.normalize(vec2.create(), reflectVec2(heightNorm, vec2.fromValues(0, 1)));
        const qNegative = vec2.negate(vec2.create(), rectCenter );

        const xTranslate = vec2.dot(qNegative, vec2.fromValues(xAxis[0], yAxis[0]));
        const yTranslate = vec2.dot(qNegative, vec2.fromValues(xAxis[1], yAxis[1]));

        const transform = mat3.fromValues(
            xAxis[0],     xAxis[1],     0,
            yAxis[0],     yAxis[1],     0,
            xTranslate,   yTranslate,   1
        );

        return transform;
    }

    export function BoxSDF(point: Readonly<vec3>, boxCenter: Readonly<vec3>, widthSpan: Readonly<vec3>, heightSpan: Readonly<vec3>, depthSpan: Readonly<vec3>) : number {
        const boxAlignedSpaceTransform = transformToBoxAlignedSpace(boxCenter, widthSpan, heightSpan, depthSpan);
        const transformedPoint = vec4.transformMat4(vec4.create(), vec3tovec4(point, true), boxAlignedSpaceTransform);

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

    export function RectangleSDF(point: Readonly<vec2>, rectCenter: Readonly<vec2>, widthSpan: Readonly<vec2>, heightSpan: Readonly<vec2>) : number {
        const rectAlignedSpaceTransform = transformToRectangleAlignedSpace(rectCenter, widthSpan, heightSpan);
        const transformedPoint = vec3.transformMat3(vec3.create(), vec3.fromValues(point[0], point[1], 1), rectAlignedSpaceTransform);

        const halfWidth = vec2.distance(vec2.create(), widthSpan);
        const halfHeight = vec2.distance(vec2.create(), heightSpan);

        const dimensions = vec2.fromValues(halfWidth, halfHeight);

        // Outside of the box
        const absPoint = vec2abs(vec2.create(), vec2.fromValues(transformedPoint[0], transformedPoint[1]));
        const distanceVector = vec2.subtract(vec2.create(), absPoint, dimensions);
        const clampedDistanceVector = vec2clampNegative(vec2.create(), distanceVector);

        const outsideDistance = vec2.distance(vec2.create(), clampedDistanceVector);
        
        // Inside of the box
        const insideDistance = Math.min(vec2maxcomp(distanceVector), 0);

        return outsideDistance + insideDistance;
    }

    export function SphereSDF(point: Readonly<vec3>, sphereCenter: Readonly<vec3>, sphereRadius: number): number {
        
        var pointToSphereCenter = vec3.create();
        vec3.sub(pointToSphereCenter, sphereCenter, point);
        const distance = vec3.length(pointToSphereCenter) - sphereRadius;
        
        return distance;
    }

    export function CircleSDF(point: Readonly<vec2>, circleCenter: Readonly<vec2>, circleRadius: number): number {
        var pointToCircleCenter = vec2.create();
        vec2.sub(pointToCircleCenter, circleCenter, point);
        const distance = vec2.length(pointToCircleCenter) - circleRadius;

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

    export function CapsuleCollision(point: Readonly<vec4>, capsuleBase: Readonly<vec3>, capsuleExtension: Readonly<vec3>, radius: number) : boolean {
        return CapsuleSDF(point, capsuleBase, capsuleExtension, radius) <= 0;
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

    export function BoxCollision(point: Readonly<vec4>, boxCenter: Readonly<vec3>, widthSpan: Readonly<vec3>, heightSpan: Readonly<vec3>, depthSpan: Readonly<vec3>) : boolean {
        const boxAlignedSpaceTransform = transformToBoxAlignedSpace(boxCenter, widthSpan, heightSpan, depthSpan);
        const transformedPoint = vec4.transformMat4(vec4.create(), point, boxAlignedSpaceTransform);

        const halfWidth = vec3.distance(vec3.create(), widthSpan);
        const halfHeight = vec3.distance(vec3.create(), heightSpan);
        const halfDepth = vec3.distance(vec3.create(), depthSpan);

        const dimensions = vec3.fromValues(halfWidth, halfHeight, halfDepth);
        
        const absPoint = vec3abs(vec3.create(), vec4tovec3(transformedPoint));
        const distanceVector = vec3.subtract(vec3.create(), absPoint, dimensions);

        return vec3maxcomp(distanceVector) <= 0;
    }

    export function SphereCollision(point: Readonly<vec3>, sphereCenter: Readonly<vec3>, sphereRadius: number): boolean {
        // No optimization here really.
        return SphereSDF(point, sphereCenter, sphereRadius) <= 0;
    }
}