import { MetaName, ComponentBase } from "./Component"
import { UuidGenerator, Uuid } from "./UuidGenerator";
import { World } from "../World/World"
import { throws } from "assert";
import { Transform } from "./Transform";
import { mat4 } from "gl-matrix"

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

    getTransform() : Transform {
        return this._transform;
    }
    
    getComponents() : Readonly<Map<MetaName, ComponentBase[]>> {
        return this._componentsMap;
    }

    getComponentsByType(name: MetaName): Readonly<ComponentBase[]> {
        if (this._componentsMap.has(name)) {
            return this._componentsMap.get(name)!
        }
        return [];
    }

    registerComponent(component: ComponentBase) {
        if (!this._componentsMap.has(component.metaName)) 
        {
            this._componentsMap.set(component.metaName, [])
        }
        this._componentsMap.get(component.metaName)?.push(component);
    }

    unregisterComponent(component: ComponentBase) {
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

    addChild(entity: Entity) {
        this._children.push(entity);
    }

    removeChild(entity: Entity) {
        const index =  this._children.indexOf(entity, 0);
        if (index > -1) {
            this._children.splice(index, 1);
        }
    }

    getParent(): Readonly<Entity> | undefined {
        return this._parent ? this._parent : undefined;
    }

    getUuid(): Readonly<Uuid> {
        return this._uuid
    }

    getWorld(): Readonly<World> {
        return this._world;
    }
}