import { MetaName, Component } from "./Component"
import { UuidGenerator, Uuid } from "./UuidGenerator";
import { World } from "../World/World"
import { throws } from "assert";

export class Entity {
    private _world: World;
    private _componentsMap: Map<MetaName, Component[]>
    private _parent: Readonly<Entity> | undefined;
    private _children: Entity[];
    private _uuid: Uuid;

    constructor(world: World, parent: Readonly<Entity> | undefined, uuid: Uuid) {
        this._componentsMap = new Map<MetaName, Component[]>();
        this._world = world;
        this._parent = parent;
        this._children = [];
        this._uuid = uuid;
    }

    getComponents() : Readonly<Map<MetaName, Component[]>> {
        return this._componentsMap;
    }

    getComponentsByType(name: MetaName): Readonly<Component[]> {
        if (this._componentsMap.has(name)) {
            return this._componentsMap.get(name)!
        }
        return [];
    }

    registerComponent(component: Component) {
        if (!this._componentsMap.has(component.metaName)) 
        {
            this._componentsMap.set(component.metaName, [])
        }
        this._componentsMap.get(component.metaName)?.push(component);
    }

    unregisterComponent(component: Component) {
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