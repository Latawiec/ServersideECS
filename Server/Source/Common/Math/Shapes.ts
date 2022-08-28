import { ReadonlyVec3, vec3, vec2, vec4, mat3, mat4 } from "gl-matrix"

export namespace Shapes {

    export namespace D2 {

        export abstract class Shape {
        }

        export class Rectangle implements Shape {
            width : number = 1.0;
            height : number = 1.0;

            get widthExtensionVec() : vec2 {
                return [this.width, 0];
            }

            get heightExtensionVec() : vec2 {
                return [0, this.height];
            }
        };

        export class Circle implements Shape {
            radius : number = 1.0;
        };
    };

    export namespace D3 {
        
        export abstract class Shape {
            abstract transformMat4(transform: Readonly<mat4>) : Shape;
        }

        export class Box {
            width : number = 1.0;
            height : number = 1.0;
            depth : number = 1.0;
        };

        export class Sphere {
            radius : number = 1.0;
        };

        export class Capsule {
            radius: number = 1.0;
            height: number = 1.0;
        };
    }
}