import { throws } from "assert";
import { Entity } from "../Base/Entity"
import { UuidGenerator } from "../Base/UuidGenerator"
import { TransformSystem } from "../Systems/TransformSystem"
import { ScriptSystem } from "../Systems/ScriptSystem";
import { Script } from "vm";
import { DrawableSystem } from "../Systems/DrawableSystem";
import { ClientConnectionSystem } from "../Systems/ClientConnectionSystem";

export class World {
    private _rootNode: Entity;
    private _entities: Entity[];
    private _entityUuidGenerator: UuidGenerator;
    private _transformSystem: TransformSystem;
    private _scriptSystem: ScriptSystem;
    private _drawableSystem: DrawableSystem;
    private _clientConnectionSystem: ClientConnectionSystem;


    constructor() {
        this._entityUuidGenerator = new UuidGenerator();
        this._transformSystem = new TransformSystem();
        this._scriptSystem = new ScriptSystem();
        this._drawableSystem = new DrawableSystem();
        this._clientConnectionSystem = new ClientConnectionSystem();

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
    
    get scriptSystem(): ScriptSystem {
        return this._scriptSystem;
    }

    get transformSystem(): TransformSystem {
        return this._transformSystem;
    }
    
    get drawableSystem(): DrawableSystem {
        return this._drawableSystem;
    }

    get clientConnectionSystem(): ClientConnectionSystem {
        return this._clientConnectionSystem;
    }
}