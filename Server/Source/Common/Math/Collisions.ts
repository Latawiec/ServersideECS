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
            // Using rectOne as reference point.
            const rectsOffset = vec2.sub(vec2.create(), rectTwo.position, rectOne.position);
            
            // rectOne extensions decomposition.
            const xExtensionDecomposed = new vec2decomposed(rectOne.xExtension);
            const yExtensionDecomposed = new vec2decomposed(rectOne.yExtension);

            // find rectTwo diagonals.
            const diagonalOne = vec2.add(vec2.create(), rectTwo.xExtension, rectTwo.yExtension);
            const diagonalOneOffset = rectsOffset;
            const diagonalTwo = vec2.add(vec2.create(), vec2.negate(vec2.create(), rectTwo.xExtension),  rectTwo.yExtension);
            const diagonalTwoOffest = vec2.add(vec2.create(), rectTwo.xExtension, rectsOffset);

            const xOverlap = function() {
                const diagOneCast = vec2.dot(diagonalOne, xExtensionDecomposed.unitVector);
                const diagOneOffsetCast = vec2.dot(diagonalOneOffset, xExtensionDecomposed.unitVector);
                const diagTwoCast = vec2.dot(diagonalTwo, xExtensionDecomposed.unitVector);
                const diagTwoOffsetCast = vec2.dot(diagonalTwoOffest, xExtensionDecomposed.unitVector);

                return doesOverlap( 0, xExtensionDecomposed.length, diagOneOffsetCast, diagOneCast)
                    || doesOverlap( 0, xExtensionDecomposed.length, diagTwoOffsetCast, diagTwoCast);
            }();

            const yOverlap = function() {
                const diagOneCast = vec2.dot(diagonalOne, yExtensionDecomposed.unitVector);
                const diagOneOffsetCast = vec2.dot(diagonalOneOffset, yExtensionDecomposed.unitVector);
                const diagTwoCast = vec2.dot(diagonalTwo, yExtensionDecomposed.unitVector);
                const diagTwoOffsetCast = vec2.dot(diagonalTwoOffest, yExtensionDecomposed.unitVector);

                return doesOverlap( 0, yExtensionDecomposed.length, diagOneOffsetCast, diagOneCast)
                    || doesOverlap( 0, yExtensionDecomposed.length, diagTwoOffsetCast, diagTwoCast);
            }();

            return xOverlap && yOverlap;
        }

        export function CheckRectangleCircle(rect: Readonly<Shapes.D2.Rectangle>, circle: Readonly<Shapes.D2.Circle>) : boolean {
            const circleToBoxDistance = SDF.RectangleSDF(circle.position, rect.position, rect.xExtension, rect.yExtension);
            return circleToBoxDistance <= circle.radius;
        }

        export function CheckRectanglePoint(rect: Readonly<Shapes.D2.Rectangle>, point: Readonly<vec2>) : boolean {
            return SDF.RectangleSDF(point, rect.position, rect.xExtension, rect.yExtension) <= 0;
        }

        export function CheckCircleCircle(circleOne: Readonly<Shapes.D2.Circle>, circleTwo: Readonly<Shapes.D2.Circle>) : boolean {
            return vec2.distance(circleOne.position, circleTwo.position) <= circleOne.radius + circleTwo.radius;
        }

        export function CheckCirclePoint(circle: Readonly<Shapes.D2.Circle>, point: Readonly<vec2>) : boolean {
            return SDF.CircleSDF(point, circle.position, circle.radius) <= 0;
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