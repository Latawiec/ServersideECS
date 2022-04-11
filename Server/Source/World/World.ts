import { throws } from "assert";
import { Entity } from "../Base/Entity"
import { UuidGenerator } from "../Base/UuidGenerator"
import { TransformSystem } from "../Systems/TransformSystem"
import { ScriptSystem } from "../Systems/ScriptSystem";
import { Script } from "vm";
import { DrawingSystem } from "../Systems/DrawingSystem";
import { ClientConnectionSystem } from "../Systems/ClientConnectionSystem";

export class World {
    private _rootNode: Entity;
    private _entities: Entity[];
    private _entityUuidGenerator: UuidGenerator;
    private _transformSystem: TransformSystem.System;
    private _scriptSystem: ScriptSystem.System;
    private _drawableSystem: DrawingSystem.System;
    private _clientConnectionSystem: ClientConnectionSystem.System;


    constructor() {
        this._entityUuidGenerator = new UuidGenerator();
        this._transformSystem = new TransformSystem.System();
        this._scriptSystem = new ScriptSystem.System();
        this._drawableSystem = new DrawingSystem.System();
        this._clientConnectionSystem = new ClientConnectionSystem.System();

        this._rootNode = new Entity(this, undefined, this._entityUuidGenerator.getNext());
        this._entities = [ this._rootNode ];
    }

    createEntity(parent?: Readonly<Entity>): Entity {
        var result = new Entity(this, parent ? parent : this._rootNode , this._entityUuidGenerator.getNext());
        this._entities.push(result);
        return result;
    }

    getRoot(): Readonly<Entity> {
        return this._rootNode
    }

    getEntites(): Readonly<Entity[]> {
        return this._entities;
    }

    update() {
        this._scriptSystem.onUpdate();
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