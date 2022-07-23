import { throws } from "assert";
import { Entity } from "../Base/Entity"
import { UuidGenerator } from "../Base/UuidGenerator"
import { TransformSystem } from "../Systems/TransformSystem"
import { ScriptSystem } from "../Systems/ScriptSystem";
import { Script } from "vm";
import { DrawingSystem } from "../Systems/DrawingSystem";
import { ClientConnectionSystem } from "../Systems/ClientConnectionSystem";
import { ComponentBase } from "../Base/Component";
import * as AssetManager from "../Assets/AssetManager";

export class World {
    private _rootNode: Entity;
    private _entities: Entity[];
    private _entityUuidGenerator: UuidGenerator;
    private _transformSystem: TransformSystem.System;
    private _scriptSystem: ScriptSystem.System;
    private _drawableSystem: DrawingSystem.System;
    private _clientConnectionSystem: ClientConnectionSystem.System;
    private _assetManager: AssetManager.AssetManager;

    constructor() {
        this._entityUuidGenerator = new UuidGenerator();
        this._transformSystem = new TransformSystem.System();
        this._scriptSystem = new ScriptSystem.System();
        this._drawableSystem = new DrawingSystem.System();
        this._clientConnectionSystem = new ClientConnectionSystem.System();
        this._assetManager = new AssetManager.AssetManager("");

        this._rootNode = new Entity(this, undefined, this._entityUuidGenerator.getNext());
        this._entities = [ this._rootNode ];
    }

    protected setAssetPath(assetPath: Readonly<string>) {
        this._assetManager = new AssetManager.AssetManager(assetPath);
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
            case TransformSystem.System.staticMetaName():
                this._transformSystem.registerComponent(component as TransformSystem.Component);
                break;

            case ScriptSystem.System.staticMetaName():
                this._scriptSystem.registerComponent(component as ScriptSystem.Component);
                break;

            case DrawingSystem.System.staticMetaName():
                this._drawableSystem.registerComponent(component as DrawingSystem.Component);
                break;

            case ClientConnectionSystem.System.staticMetaName():
                this._clientConnectionSystem.registerComponent(component as ClientConnectionSystem.Component);
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
            case TransformSystem.System.staticMetaName():
                this._transformSystem.unregisterComponent(component as TransformSystem.Component);
                break;

            case ScriptSystem.System.staticMetaName():
                this._scriptSystem.unregisterComponent(component as ScriptSystem.Component);
                break;

            case DrawingSystem.System.staticMetaName():
                this._drawableSystem.unregisterComponent(component as DrawingSystem.Component);
                break;

            case ClientConnectionSystem.System.staticMetaName():
                this._clientConnectionSystem.unregisterComponent(component as ClientConnectionSystem.Component);
                break;

            default:
                throw "Tried to get system that doesn't exist";
        }
        component.ownerEntity?.unregisterComponent(component);
    }

    getAsset(assetPath: Readonly<string>, onSuccess: (asset: AssetManager.Asset)=>void, onError: (error: AssetManager.AssetError)=>void ): any {
        this._assetManager.getAsset(assetPath, onSuccess, onError);
    }

    getRoot(): Readonly<Entity> {
        return this._rootNode
    }
    
    getEntites(): Readonly<Entity[]> {
        return this._entities;
    }
    
    update() {
        this._transformSystem.updateWorldTransforms(this._rootNode);
        this._scriptSystem.preUpdate();
        this._scriptSystem.onUpdate();
        this._scriptSystem.postUpdate();
    }
    
    get scriptSystem(): ScriptSystem.System {
        return this._scriptSystem;
    }

    get transformSystem(): TransformSystem.System {
        return this._transformSystem;
    }
    
    get drawableSystem(): DrawingSystem.System {
        return this._drawableSystem;
    }

    get clientConnectionSystem(): ClientConnectionSystem.System {
        return this._clientConnectionSystem;
    }
}