import { ReadonlyVec3, vec2, vec3, vec4, mat4 } from "gl-matrix"
import { Shapes } from "./Shapes"
import { SDF } from "./SDF"
import { vec3tovec4, vec2decomposed, vec3decomposed } from "./gl-extensions";

export namespace Collisions {

    function checkOverlap(aOffset: number, aLength: number, bOffset: number, bLength: number) : number {
        aOffset = Math.min(aOffset, aOffset + aLength);
        aLength = Math.abs(aLength);
        
        bOffset = Math.min(bOffset, bOffset + bLength);
        bLength = Math.abs(bLength);

        const result = Math.min(aOffset + aLength, bOffset + bLength) - Math.max(aOffset, bOffset);
        return result; 
    }

    function doesOverlap(aOffset: number, aLength: number, bOffset: number, bLength: number) : boolean {
        return checkOverlap(aOffset, aLength, bOffset, bLength) >= 0;
    }

    export namespace D2 {
        export class RectangleCollider {
            position: vec2 = [0, 0];
            xExtension: vec2 = [1, 0];
            yExtension: vec2 = [0, 1];
        };

        export class CircleCollider {
            position: vec2 = [0, 0];
            radius: number = 1.0;
        }

        export class PointCollider {
            position: vec2 = [0, 0];
        }

        export class PlaneCollider {
            normal: vec2 = [1, 0];
            distance: number = 0.0;
        }

        export function CheckCirclePlane(circle: Readonly<CircleCollider>, plane: Readonly<PlaneCollider>) : boolean {
            const circlePosPlaneNormalCast = vec2.dot(circle.position, plane.normal);


            return circle.radius <= plane.distance;
        }

        export function CheckRectangleRectangle(rectOne: Readonly<RectangleCollider>, rectTwo: Readonly<RectangleCollider>) : boolean {
            
            const rectOneDim = {
                widthVecDecomp: new vec2decomposed(vec2.scale(vec2.create(), rectOne.xExtension, 2)),
                heightVecDecomp: new vec2decomposed(vec2.scale(vec2.create(), rectOne.yExtension, 2)),
                cornerPos: vec2.sub(vec2.create(), vec2.sub(vec2.create(), rectOne.position, rectOne.xExtension), rectOne.yExtension)
            };

            const rectTwoDim = {
                cornerPos: vec2.sub(vec2.create(), vec2.sub(vec2.create(), rectTwo.position, rectTwo.xExtension), rectTwo.yExtension)
            }

            const rectTwoDiagonals = {
                diagonalOne: vec2.scale(vec2.create(), vec2.add(vec2.create(), rectTwo.yExtension, rectTwo.xExtension), 2),
                diagonalTwo: vec2.scale(vec2.create(), vec2.sub(vec2.create(), rectTwo.yExtension, rectTwo.xExtension), 2),
                // Distance from corner of rectOne (being our 0, 0) to diagonals
                diagonalOneOffset: vec2.sub(vec2.create(), rectTwoDim.cornerPos, rectOneDim.cornerPos),
                diagonalTwoOffset: vec2.add(vec2.create(), vec2.sub(vec2.create(), rectTwoDim.cornerPos, rectOneDim.cornerPos), vec2.scale(vec2.create(), rectTwo.xExtension, 2))
            }

            const widthOverlap = function() {
                const diagOneCast = vec2.dot(rectTwoDiagonals.diagonalOne, rectOneDim.widthVecDecomp.unitVector);
                const diagOneOffsetCast = vec2.dot(rectTwoDiagonals.diagonalOneOffset, rectOneDim.widthVecDecomp.unitVector);
                const diagTwoCast = vec2.dot(rectTwoDiagonals.diagonalTwo, rectOneDim.widthVecDecomp.unitVector);
                const diagTwoOffsetCast = vec2.dot(rectTwoDiagonals.diagonalTwoOffset, rectOneDim.widthVecDecomp.unitVector);

                return doesOverlap( 0, rectOneDim.widthVecDecomp.length, diagOneOffsetCast, diagOneCast)
                    || doesOverlap( 0, rectOneDim.widthVecDecomp.length, diagTwoOffsetCast, diagTwoCast);
            }();

            const heightOverlap = function() {
                const diagOneCast = vec2.dot(rectTwoDiagonals.diagonalOne, rectOneDim.heightVecDecomp.unitVector);
                const diagOneOffsetCast = vec2.dot(rectTwoDiagonals.diagonalOneOffset, rectOneDim.heightVecDecomp.unitVector);
                const diagTwoCast = vec2.dot(rectTwoDiagonals.diagonalTwo, rectOneDim.heightVecDecomp.unitVector);
                const diagTwoOffsetCast = vec2.dot(rectTwoDiagonals.diagonalTwoOffset, rectOneDim.heightVecDecomp.unitVector);

                return doesOverlap( 0, rectOneDim.heightVecDecomp.length, diagOneOffsetCast, diagOneCast)
                    || doesOverlap( 0, rectOneDim.heightVecDecomp.length, diagTwoOffsetCast, diagTwoCast);
            }();

            return widthOverlap && heightOverlap;
        }

        export function CheckRectangleCircle(rect: Readonly<RectangleCollider>, circle: Readonly<CircleCollider>) : boolean {
            const circleToBoxDistance = SDF.RectangleSDF(circle.position, rect.position, rect.xExtension, rect.yExtension);
            return circleToBoxDistance <= circle.radius;
        }

        export function CheckRectanglePoint(rect: Readonly<RectangleCollider>, point: Readonly<PointCollider>) : boolean {
            return SDF.RectangleSDF(point.position, rect.position, rect.xExtension, rect.yExtension) <= 0;
        }

        export function CheckCircleCircle(circleOne: Readonly<CircleCollider>, circleTwo: Readonly<CircleCollider>) : boolean {
            return vec2.distance(circleOne.position, circleTwo.position) <= circleOne.radius + circleTwo.radius;
        }

        export function CheckCirclePoint(circle: Readonly<CircleCollider>, point: Readonly<PointCollider>) : boolean {
            return SDF.CircleSDF(point.position, circle.position, circle.radius) <= 0;
        }

// Measure actual distance vector
        export function CircleCircleDistance(fromCircle: Readonly<CircleCollider>, targetCircle: Readonly<CircleCollider>) : vec2decomposed {
            const distanceVector = vec2.sub(vec2.create(), targetCircle.position, fromCircle.position);
            const distanceDecomposed = new vec2decomposed(distanceVector)
            distanceDecomposed.length -= fromCircle.radius;
            distanceDecomposed.length -= targetCircle.radius;

            return distanceDecomposed;
        }

        export function PlaneCircleDistance(fromPlane: Readonly<PlaneCollider>, targetCircle: Readonly<CircleCollider>) : vec2decomposed {
            const planeClosestCirclePos = vec2.add(vec2.create(), targetCircle.position, vec2.scale(vec2.create(), fromPlane.normal, targetCircle.radius));

            const planeClosestCirclePosOnPlaneNormal = vec2.dot(planeClosestCirclePos, fromPlane.normal);
            const distance = planeClosestCirclePosOnPlaneNormal - fromPlane.distance;
            
            return new vec2decomposed(fromPlane.normal, distance);
        }

        export function CirclePlaneDistance(fromCircle: Readonly<CircleCollider>, targetPlane: Readonly<PlaneCollider>) : vec2decomposed {
            const planeToCircle = PlaneCircleDistance(targetPlane, fromCircle);
            return new vec2decomposed(planeToCircle.unitVector, -planeToCircle.length);
        }
    }
}