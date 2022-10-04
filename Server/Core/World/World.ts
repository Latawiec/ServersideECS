import { Entity } from "../Base/Entity"
import { Uuid, UuidGenerator } from "../Base/UuidGenerator"
import { ScriptSystem } from "@core/Systems/ScriptSystem";
import { mat4 } from "gl-matrix"
import { DrawingSystem } from "@core/Systems/DrawingSystem";
import { ClientConnectionSystem } from "@core/Systems/ClientConnectionSystem";
import { ComponentBase } from "../Base/Component";
import * as AssetManager from "../Assets/AssetManager";
import { TriggerCollisionSystem2D } from "@core/Systems/TriggerCollisionSystem2D";
import { BlockingCollisionSystem2D } from "@core/Systems/BlockingCollisionSystem2D";
import { CameraSystem } from "@core/Systems/CameraSystem";
import { GlobalClock } from "@core/Base/GlobalClock";

export class World {
    private _rootNode: Entity;
    private _entities: Entity[];
    private _entityUuidGenerator: UuidGenerator;
    private _scriptSystem: ScriptSystem.System;
    private _drawableSystem: DrawingSystem.System;
    private _clientConnectionSystem: ClientConnectionSystem.System;
    private _triggerCollisionSystem2D: TriggerCollisionSystem2D.System;
    private _blockingCollisionSystem2D: BlockingCollisionSystem2D.System;
    private _cameraSystem: CameraSystem.System;
    private _assetManager: AssetManager.AssetManager;

    constructor(worldAssets: Readonly<string>) {
        this._entityUuidGenerator = new UuidGenerator();
        this._scriptSystem = new ScriptSystem.System();
        this._drawableSystem = new DrawingSystem.System();
        this._clientConnectionSystem = new ClientConnectionSystem.System();
        this._triggerCollisionSystem2D = new TriggerCollisionSystem2D.System();
        this._blockingCollisionSystem2D = new BlockingCollisionSystem2D.System();
        this._cameraSystem = new CameraSystem.System();
        this._assetManager = new AssetManager.AssetManager(worldAssets);

        this._rootNode = new Entity(this, undefined, this._entityUuidGenerator.getNext());
        this._entities = [ this._rootNode ];
    }

    createEntity(parent?: Readonly<Entity>): Entity {
        const parentEntity = parent ? parent : this._rootNode;
        var result = new Entity(this, parentEntity , this._entityUuidGenerator.getNext());
        this._entities.push(result);
        parentEntity.addChild(result);
        return result;
    }

    destroyEntity(entity: Entity): boolean {
        entity.components.forEach((components, metaname) => {
            for (const component of components) {
                this.unregisterComponent(component)
            }
        })

        const index =  this._entities.indexOf(entity, 0);
        if (index > -1) {
            this._entities.splice(index, 1);
        }

        entity.parent?.removeChild(entity);
        return true;
    }

    registerComponent(owner: Entity, component: ComponentBase): Uuid {
        const systemMetaName = component.systemMetaName;
        let registeredUuid: Uuid;

        switch (systemMetaName) {
            case ScriptSystem.System.staticMetaName():
                registeredUuid = this._scriptSystem.registerComponent(component as ScriptSystem.Component);
                break;

            case DrawingSystem.System.staticMetaName():
                registeredUuid = this._drawableSystem.registerComponent(component as DrawingSystem.Component);
                break;

            case ClientConnectionSystem.System.staticMetaName():
                registeredUuid = this._clientConnectionSystem.registerComponent(component as ClientConnectionSystem.Component);
                break;
            
            case TriggerCollisionSystem2D.System.staticMetaName():
                registeredUuid = this._triggerCollisionSystem2D.registerComponent(component as TriggerCollisionSystem2D.Component);
                break;

            case BlockingCollisionSystem2D.System.staticMetaName():
                registeredUuid = this._blockingCollisionSystem2D.registerComponent(component as BlockingCollisionSystem2D.Component);
                break;
            
            case CameraSystem.System.staticMetaName():
                registeredUuid = this._cameraSystem.registerComponent(component as CameraSystem.Component);
                break;

            default:
                throw "Tried to get system that doesn't exist";
        }
        owner.addComponent(component);
        return registeredUuid;
    }

    unregisterComponent(component: ComponentBase) {
        const systemAsignmentMetaName = component.systemMetaName;

        // Maybe TypeScript has better way to take care of this... But I don't know it yet.
        switch (systemAsignmentMetaName) {

            case ScriptSystem.System.staticMetaName():
                this._scriptSystem.unregisterComponent(component as ScriptSystem.Component);
                break;

            case DrawingSystem.System.staticMetaName():
                this._drawableSystem.unregisterComponent(component as DrawingSystem.Component);
                break;

            case ClientConnectionSystem.System.staticMetaName():
                this._clientConnectionSystem.unregisterComponent(component as ClientConnectionSystem.Component);
                break;
            
            case TriggerCollisionSystem2D.System.staticMetaName():
                this._triggerCollisionSystem2D.unregisterComponent(component as TriggerCollisionSystem2D.Component);
                break;

            case BlockingCollisionSystem2D.System.staticMetaName():
                this._blockingCollisionSystem2D.unregisterComponent(component as BlockingCollisionSystem2D.Component);
                break;
            
            case CameraSystem.System.staticMetaName():
                this._cameraSystem.unregisterComponent(component as CameraSystem.Component);
                break;

            default:
                throw "Tried to get system that doesn't exist";
        }
        component.ownerEntity?.removeComponent(component);
    }

    getAsset(assetPath: Readonly<string>, onSuccess: (asset: AssetManager.Asset)=>void, onError: (error: AssetManager.AssetError)=>void ): any {
        this._assetManager.getAsset(assetPath, onSuccess, onError);
    }

    bindAsset(assetPath: Readonly<string>) : AssetManager.AssetBinding {
        return this._assetManager.bindAsset(assetPath);
    }

    get assetManager(): Readonly<AssetManager.AssetManager> {
        return this._assetManager
    }

    getRoot(): Readonly<Entity> {
        return this._rootNode
    }
    
    getEntites(): Readonly<Entity[]> {
        return this._entities;
    }
    
    update() {
        this.updateWorldTransforms(this._rootNode);
        GlobalClock.clock.nextFrame();
        this._scriptSystem.preUpdate();
        this._triggerCollisionSystem2D.update();
        this._scriptSystem.onUpdate();
        this._scriptSystem.postUpdate();
        this._blockingCollisionSystem2D.update();
        this._drawableSystem.update();
    }

    updateWorldTransforms(entity: Readonly<Entity>, parentTransform: Readonly<mat4> = mat4.create()) {
        entity.transform.updateWorldTransform(parentTransform);
        for(const child of entity.getChildren()) {
            this.updateWorldTransforms(child, entity.transform.worldTransform);
        }
    }
    
    get scriptSystem(): ScriptSystem.System {
        return this._scriptSystem;
    }
    
    get drawableSystem(): DrawingSystem.System {
        return this._drawableSystem;
    }

    get cameraSystem(): CameraSystem.System {
        return this._cameraSystem;
    }

    get clientConnectionSystem(): ClientConnectionSystem.System {
        return this._clientConnectionSystem;
    }
}