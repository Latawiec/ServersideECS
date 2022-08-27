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
        export function CheckRectangleRectangle(rectOne: Readonly<Shapes.D2.Rectangle>, rectTwo: Readonly<Shapes.D2.Rectangle>) : boolean {
            
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

        export function CheckRectangleCircle(rect: Readonly<Shapes.D2.Rectangle>, circle: Readonly<Shapes.D2.Circle>) : boolean {
            const circleToBoxDistance = SDF.RectangleSDF(circle.position, rect.position, rect.xExtension, rect.yExtension);
            return circleToBoxDistance <= circle.radius;
        }

        export function CheckRectanglePoint(rect: Readonly<Shapes.D2.Rectangle>, point: Readonly<Shapes.D2.Point>) : boolean {
            return SDF.RectangleSDF(point.position, rect.position, rect.xExtension, rect.yExtension) <= 0;
        }

        export function CheckCircleCircle(circleOne: Readonly<Shapes.D2.Circle>, circleTwo: Readonly<Shapes.D2.Circle>) : boolean {
            return vec2.distance(circleOne.position, circleTwo.position) <= circleOne.radius + circleTwo.radius;
        }

        export function CheckCirclePoint(circle: Readonly<Shapes.D2.Circle>, point: Readonly<Shapes.D2.Point>) : boolean {
            return SDF.CircleSDF(point.position, circle.position, circle.radius) <= 0;
        }
    }

    export function CheckBoxBox(boxOne: Readonly<Shapes.D3.Box>, boxTwo: Readonly<Shapes.D3.Box>) : boolean {
        const boxesOffset = vec3.sub(vec3.create(), boxTwo.position, boxOne.position);

        const xExtensionDecomposed = new vec3decomposed(boxOne.xExtension);
        const yExtensionDecomposed = new vec3decomposed(boxOne.yExtension);
        const zExtensionDecomposed = new vec3decomposed(boxOne.zExtension);

        const offsetX = vec3.dot(boxesOffset, xExtensionDecomposed.unitVector);
        const offsetY = vec3.dot(boxesOffset, yExtensionDecomposed.unitVector);
        const offsetZ = vec3.dot(boxesOffset, zExtensionDecomposed.unitVector);

        // TODO

        return false;
    }

    export function CheckBoxSphere(box: Readonly<Shapes.D3.Box>, sphere: Readonly<Shapes.D3.Sphere>) : boolean {
        const sphereToBoxDistance = SDF.BoxSDF(sphere.position, box.position, box.xExtension, box.yExtension, box.zExtension);
        return sphereToBoxDistance <= sphere.radius;
    }

}