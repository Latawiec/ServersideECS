import { ReadonlyVec3, vec3, vec2, vec4, mat3, mat4 } from "gl-matrix"

export namespace Shapes {

    export namespace D2 {

        export abstract class Shape {
            abstract transformMat4(transform: Readonly<mat4>) : Shape;
            abstract transformMat3(transform: Readonly<mat3>) : Shape;
        }

        export class Rectangle implements Shape {
            position: vec2 = [ 0, 0 ];
            xExtension: vec2 = [ 1, 0 ];
            yExtension: vec2 = [0, 1];  

            transformMat4(transform: Readonly<mat4>): Rectangle {
                const positionVec4 = vec4.fromValues(this.position[0], 0, this.position[1], 1);
                const xExtensionVec4 = vec4.fromValues(this.xExtension[0], 0, this.xExtension[1], 0);
                const yExtensionVec4 = vec4.fromValues(this.yExtension[0], 0, this.yExtension[1], 0);

                const newPosition = vec4.transformMat4(vec4.create(), positionVec4, transform);
                const newXExtension = vec4.transformMat4(vec4.create(), xExtensionVec4, transform);
                const newYExtension = vec4.transformMat4(vec4.create(), yExtensionVec4, transform);

                const resultShape = new Rectangle();
                resultShape.position = vec2.fromValues(newPosition[0], newPosition[2]);
                resultShape.xExtension = vec2.fromValues(newXExtension[0], newXExtension[2]);
                resultShape.yExtension = vec2.fromValues(newYExtension[0], newYExtension[2]);

                return resultShape;
            }
            transformMat3(transform: Readonly<mat3>): Rectangle {
                const positionVec3 = vec3.fromValues(this.position[0], this.position[1], 1);
                const xExtensionVec3 = vec3.fromValues(this.xExtension[0], this.xExtension[1], 0);
                const yExtensionVec3 = vec3.fromValues(this.yExtension[0], this.yExtension[1], 0);

                const newPosition = vec3.transformMat3(vec3.create(), positionVec3, transform);
                const newXExtension = vec3.transformMat3(vec3.create(), xExtensionVec3, transform);
                const newYExtension = vec3.transformMat3(vec3.create(), yExtensionVec3, transform);
                
                const resultShape = new Rectangle();
                resultShape.position = vec2.fromValues(newPosition[0], newPosition[1]);
                resultShape.xExtension = vec2.fromValues(newXExtension[0], newXExtension[1]);
                resultShape.yExtension = vec2.fromValues(newYExtension[0], newYExtension[1]);

                return resultShape;
            }
        };

        export class Circle implements Shape {
            position : vec2 = [ 0, 0 ];
            radius : number = 1.0;

            transformMat4(transform: Readonly<mat4>): Circle {
                const positionVec4 = vec4.fromValues(this.position[0], 0, this.position[1], 1);
                const newPosition = vec4.transformMat4(vec4.create(), positionVec4, transform);
                const resultShape = new Circle();
                resultShape.radius = this.radius;
                resultShape.position = vec2.fromValues(newPosition[0], newPosition[2]);

                return resultShape;
            }
            transformMat3(transform: Readonly<mat3>): Circle {
                const positionVec3 = vec3.fromValues(this.position[0], this.position[1], 1);
                const newPosition = vec3.transformMat3(vec3.create(), positionVec3, transform);
                const resultShape = new Circle();
                resultShape.radius = this.radius;
                resultShape.position = vec2.fromValues(newPosition[0], newPosition[1]);

                return resultShape;
            }
        };

        export class Point implements Shape {
            position: vec2 = [ 0, 0 ];

            transformMat4(transform: Readonly<mat4>): Point {
                const positionVec4 = vec4.fromValues(this.position[0], 0, this.position[1], 1);
                const newPosition = vec4.transformMat4(vec4.create(), positionVec4, transform);
                const resultShape = new Point();
                resultShape.position = vec2.fromValues(newPosition[0], newPosition[2]);

                return resultShape;
            }
            transformMat3(transform: Readonly<mat3>): Point {
                const positionVec3 = vec3.fromValues(this.position[0], this.position[1], 1);
                const newPosition = vec3.transformMat3(vec3.create(), positionVec3, transform);
                const resultShape = new Point();
                resultShape.position = vec2.fromValues(newPosition[0], newPosition[1]);

                return resultShape;
            }
        };
    };

    export namespace D3 {
        
        export abstract class Shape {
            abstract transformMat4(transform: Readonly<mat4>) : Shape;
        }

        export class Box {
            position : vec3 = [ 0, 0, 0 ];
            xExtension : vec3 = [ 1.0, 0.0, 0.0 ];
            yExtension : vec3 = [ 0.0, 1.0, 0.0 ];
            zExtension : vec3 = [ 0.0, 0.0, 1.0 ];
        };

        export class Sphere {
            position : vec3 = [ 0, 0, 0 ];
            radius : number = 1.0;
        };

        export class Capsule {
            position : vec3 = [ 0, 0, 0 ];
            radius: number = 1.0;
            extension : vec3 = [ 0.0, 1.0, 0.0 ];
        };
    }
}