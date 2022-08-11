import {mat4, vec3} from "gl-matrix"
import { ComponentBase } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { SystemBase } from "../Base/System"
import { Uuid } from "../Base/UuidGenerator"
import { TransformSystem } from "../Systems/TransformSystem";


export namespace CollisionSystem {

    export interface CollisionListener {
        onCollision(): void;
    }

    export enum Type {
        Box,
        Sphere,
        Capsule,
        Cone
    };

    export abstract class Component implements ComponentBase {
        // Metadata
        static staticMetaName(): string { return 'CollisionSystem.Component' }

        private _ownerEntity: Entity;
        private _transform: TransformSystem.Component;
        private _isActive: boolean = true;
        private _systemAsignedId: Uuid | undefined = undefined;
        
        constructor(owner: Entity) {
            this._ownerEntity = owner
            
            const ownerTransforms = owner.getComponentsByType(TransformSystem.Component.staticMetaName());
            if (ownerTransforms.length == 0) {
                throw("To make collision component, entity needs to have a transform component first.");
            }

            this._transform = ownerTransforms[0] as TransformSystem.Component;
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
            return this._ownerEntity;
        }

        get systemAsignedId(): Uuid | undefined {
            return this._systemAsignedId;
        }

        abstract get type(): Type;

        set systemAsignedId(value: Uuid | undefined) {
            this._systemAsignedId = value;
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

export class CapsuleCollisionComponent extends CollisionSystem.Component {
    
    get type(): CollisionSystem.Type {
        return CollisionSystem.Type.Capsule;
    }
}

export class BoxCollisionComponent extends CollisionSystem.Component {
    
    private _width: number = 1.0;
    private _height: number = 1.0;
    private _depth: number = 1.0;
    
    get type(): CollisionSystem.Type {
        return CollisionSystem.Type.Box;
    }
}

export class SphereCollisionComponent extends CollisionSystem.Component {
    private _radius: number = 1.0;
    
    get type(): CollisionSystem.Type {
        return CollisionSystem.Type.Sphere;
    }
}