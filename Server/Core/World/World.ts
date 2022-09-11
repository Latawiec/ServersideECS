import { throws } from "assert";
import { Entity } from "../Base/Entity"
import { UuidGenerator } from "../Base/UuidGenerator"
import { ScriptSystem } from "../Systems/ScriptSystem";
import { mat4 } from "gl-matrix"
import { DrawingSystem } from "../Systems/DrawingSystem";
import { ClientConnectionSystem } from "../Systems/ClientConnectionSystem";
import { ComponentBase } from "../Base/Component";
import * as AssetManager from "../Assets/AssetManager";
import { TriggerCollisionSystem2D } from "../Systems/TriggerCollisionSystem2D";
import { BlockingCollisionSystem2D } from "../Systems/BlockingCollisionSystem2D";

export class World {
    private _rootNode: Entity;
    private _entities: Entity[];
    private _entityUuidGenerator: UuidGenerator;
    private _scriptSystem: ScriptSystem.System;
    private _drawableSystem: DrawingSystem.System;
    private _clientConnectionSystem: ClientConnectionSystem.System;
    private _triggerCollisionSystem2D: TriggerCollisionSystem2D.System;
    private _blockingCollisionSystem2D: BlockingCollisionSystem2D.System;
    private _assetManager: AssetManager.AssetManager;

    constructor(worldAssets: Readonly<string>) {
        this._entityUuidGenerator = new UuidGenerator();
        this._scriptSystem = new ScriptSystem.System();
        this._drawableSystem = new DrawingSystem.System();
        this._clientConnectionSystem = new ClientConnectionSystem.System();
        this._triggerCollisionSystem2D = new TriggerCollisionSystem2D.System();
        this._blockingCollisionSystem2D = new BlockingCollisionSystem2D.System();
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

    registerComponent(owner: Entity, component: ComponentBase) {
        const systemAsignmentMetaName = component.systemMetaName;

        // Maybe TypeScript has better way to take care of this... But I don't know it yet.
        switch (systemAsignmentMetaName) {

            case ScriptSystem.System.staticMetaName():
                this._scriptSystem.registerComponent(component as ScriptSystem.Component);
                break;

            case DrawingSystem.System.staticMetaName():
                this._drawableSystem.registerComponent(component as DrawingSystem.Component);
                break;

            case ClientConnectionSystem.System.staticMetaName():
                this._clientConnectionSystem.registerComponent(component as ClientConnectionSystem.Component);
                break;
            
            case TriggerCollisionSystem2D.System.staticMetaName():
                this._triggerCollisionSystem2D.registerComponent(component as TriggerCollisionSystem2D.Component);
                break;

            case BlockingCollisionSystem2D.System.staticMetaName():
                this._blockingCollisionSystem2D.registerComponent(component as BlockingCollisionSystem2D.Component);
                break;

            default:
                throw "Tried to get system that doesn't exist";
        }
        owner.registerComponent(component);
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

            default:
                throw "Tried to get system that doesn't exist";
        }
        component.ownerEntity?.unregisterComponent(component);
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
        this._scriptSystem.preUpdate();
        this._scriptSystem.onUpdate();
        this._triggerCollisionSystem2D.update();
        this._scriptSystem.postUpdate();
        this._blockingCollisionSystem2D.update();
        this._drawableSystem.update();
    }

    updateWorldTransforms(entity: Readonly<Entity>, parentTransform: Readonly<mat4> = mat4.create()) {
        entity.getTransform().updateWorldTransform(parentTransform);
        for(const child of entity.getChildren()) {
            this.updateWorldTransforms(child, entity.getTransform().worldTransform);
        }
    }
    
    get scriptSystem(): ScriptSystem.System {
        return this._scriptSystem;
    }
    
    get drawableSystem(): DrawingSystem.System {
        return this._drawableSystem;
    }

    get clientConnectionSystem(): ClientConnectionSystem.System {
        return this._clientConnectionSystem;
    }
}