import { ReadonlyVec3, vec3, vec2, vec4, mat4 } from "gl-matrix"

export namespace Shapes {

    export namespace D2 {

        export class Rectangle {
            position: vec2 = [ 0, 0 ];
            xExtension: vec2 = [ 1, 0 ];
            yExtension: vec2 = [0, 1];    
        };

        export class Circle {
            position : vec2 = [ 0, 0 ];
            radius : number = 1.0;
        };

        export class Point {
            position: vec2 = [ 0, 0 ];
        };
    };

    export namespace D3 {
        
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