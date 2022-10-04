import { ComponentBase } from "./Component"
import { UuidGenerator, Uuid } from "./UuidGenerator";
import { World } from "../World/World"
import { throws } from "assert";
import { Transform } from "./Transform";
import { mat4 } from "gl-matrix"
import { MetaName } from "./MetaName";

export class Entity {
    private _world: World;
    private _componentsMap: Map<MetaName, ComponentBase[]>
    private _parent: Readonly<Entity> | undefined;
    private _children: Entity[];
    private _uuid: Uuid;

// Easier to just merge Transform and hierarchy into here.
    private _transform: Transform = new Transform();

    constructor(world: World, parent: Readonly<Entity> | undefined, uuid: Uuid) {
        this._componentsMap = new Map<MetaName, ComponentBase[]>();
        this._world = world;
        this._parent = parent;
        this._children = [];
        this._uuid = uuid;
    }

    get transform(): Transform {
        return this._transform;
    }

    get components(): Readonly<Map<MetaName, ComponentBase[]>>  {
        return this._componentsMap;
    }

    get parent(): Readonly<Entity> | undefined {
        return this._parent ? this._parent : undefined;
    }

    get uuid(): Readonly<Uuid> {
        return this._uuid
    }

    get world(): Readonly<World> {
        return this._world;
    }

    getComponentsByType(name: MetaName): Readonly<ComponentBase[]> {
        if (this._componentsMap.has(name)) {
            return this._componentsMap.get(name)!
        }
        return [];
    }

    addComponent(component: ComponentBase) {
        if (!this._componentsMap.has(component.metaName)) 
        {
            this._componentsMap.set(component.metaName, [])
        }
        this._componentsMap.get(component.metaName)?.push(component);
    }

    removeComponent(component: ComponentBase) {
        if (this._componentsMap.has(component.metaName))
        {
            var index: number = this._componentsMap.get(component.metaName)!.indexOf(component, 0);
            if (index > -1) {
                this._componentsMap.get(component.metaName)!.splice(index, 1);
            }
        }
    }

    getChildren(): Readonly<Entity[]> {
        return this._children;
    }


    // This function is actually broken. Add child should set the parent entity of the entity added.
    // Does it overwrite existing parent?
    // also it doesnt work right now.
    addChild(entity: Entity) {
        if (entity._parent != undefined || entity._parent != entity.world.getRoot()) {
            console.log("Entity already has a parent.");
        }

        entity._parent = this;
        this._children.push(entity);
    }

    removeChild(entity: Entity) {
        const index =  this._children.indexOf(entity, 0);
        if (index > -1) {
            this._children.splice(index, 1);
        }
    }
}