import { vec3 } from "gl-matrix";
import { Component } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { System } from "../Base/System";
import { Uuid } from "../Base/UuidGenerator"

export class TransformComponent implements Component {
    private static _componentId: string = this.name;
    private _ownerEntity: Entity;
    private _isActive: boolean = true;
    private _systemAsignedId: Uuid | undefined = undefined;

    private _position: vec3
    private _rotation: vec3
    private _scale: vec3

    constructor(owner: Entity) {
        this._ownerEntity = owner;
        this._position = [0, 0, 0];
        this._rotation = [0, 0, 0];
        this._scale = [0, 0, 0];
    }

    get isActive(): boolean {
        return this._isActive;
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
        return TransformComponent._componentId;
    }

    setPosition(newPosition: vec3) {
        this._position = newPosition;
    }

    get position(): Readonly<vec3> {
        return this._position;
    }
}


export class TransformSystem extends System<TransformComponent> {
    
    registerComponent(component: TransformComponent): TransformComponent {
        this._registerComponent(component);
        return component;
    }
    unregisterComponent(component: TransformComponent): TransformComponent {
        this._unregisterComponent(component);
        return component;
    }


}