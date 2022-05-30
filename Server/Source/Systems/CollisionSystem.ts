import {vec3} from "gl-matrix"
import { ComponentBase } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { SystemBase } from "../Base/System"


export namespace CollisionSystem {

    export interface CollisionListener {
        onCollision(): void;
    }

    class Component implements ComponentBase {
        // Metadata
        static staticMetaName(): string { return 'CollisionSystem.Component' }
        
        private _ownerEntity: Entity;
        private _isActive: boolean = true;
        
        constructor(owner: Entity) {
            this._ownerEntity = owner
        }
    
        get isActive(): Readonly<boolean> {
            return this._isActive
        }
        get metaName(): Readonly<string> {
            return Component.staticMetaName();
        }
        get systemMetaName(): string {
            return System.staticMetaName();
        }
        get ownerEntity(): Entity {
            throw new Error("Method not implemented.");
        }
        get systemAsignedId(): number {
            throw new Error("Method not implemented.");
        }
        set systemAsignedId(value: number) {
            throw new Error("Method not implemented.");
        }
    }

    export class System extends SystemBase<Component> {
        // Metadata
        static staticMetaName(): string { return 'CollisionSystem.System' }

        // SystemBase implementation
        get metaName(): string {
            return System.staticMetaName();
        }

        registerComponent(component: Component): Component {
            this._registerComponent(component);
            return component;
        }
        unregisterComponent(component: Component): Component {
            this._unregisterComponent(component);
            return component;
        }
    
        // static testSphereBox(sphere: Readonly<SphereCollisionComponent>, box: Readonly<BoxCollisionComponent>): boolean {
    
        //     return false
        // }
    
        // static testSphereSphere(sphereOne: Readonly<SphereCollisionComponent>, sphereTwo: Readonly<SphereCollisionComponent>): boolean {
        //     var distance = sphereOne.distance(sphereTwo.position) - sphereTwo.radius;
        //     return distance > 0;
        // }
    
        // static testBoxBox(boxOne: Readonly<BoxCollisionComponent>, boxTwo: Readonly<BoxCollisionComponent>): boolean {
        //     // For boxes we can simply find each corner point of boxTwo, and just distance them to the boxOne. Simple no?
        //     // I can pick just two closest points to other's center for distance to box test.
    
        //     return false
        // }
    }
} // namespace CollisionSystem


