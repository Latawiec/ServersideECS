import { Component } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { System } from "../Base/System";
import { Uuid } from "../Base/UuidGenerator"

export abstract class ScriptComponent implements Component {
    private static _componentId: string = this.name;
    private _ownerEntity: Entity;
    private _isActive: boolean = true;
    private _systemAsignedId: Uuid | undefined = undefined;

    constructor(owner: Entity) {
        this._ownerEntity = owner;
    }

    get isActive(): boolean {
        return this._isActive;
    }
    protected set isActive(value: boolean) {
        this._isActive;
    }

    get ownerEntity(): Entity {
        return this._ownerEntity;
    }
    get systemAsignedId(): Uuid | undefined {
        return this._systemAsignedId;
    }
    set systemAsignedId(value: Uuid | undefined) {
        this._systemAsignedId = value;
    }
    get metaName(): string {
        return ScriptComponent._componentId;
    }

    abstract preUpdate(): void;
    abstract onUpdate(): void;
    abstract postUpdate(): void;
}

export class ScriptSystem extends System<ScriptComponent> {

    registerComponent(component: ScriptComponent): ScriptComponent {
        this._registerComponent(component);
        return component;
    }
    unregisterComponent(component: ScriptComponent): ScriptComponent {
        this._unregisterComponent(component);
        return component;
    }

    preUpdate(): void {
        this._getComponentsMap().forEach(entry => {
            entry.preUpdate();
        });
    }

    onUpdate(): void {
        this._getComponentsMap().forEach(entry => {
            entry.onUpdate();
        });
    }

    postUpdate(): void {
        this._getComponentsMap().forEach(entry => {
            entry.postUpdate();
        });
    }
}