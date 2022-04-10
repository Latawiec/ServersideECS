import { throws } from "assert";
import { Component } from "../Base/Component"
import { Entity } from "../Base/Entity";
import { System } from "../Base/System"
import { Uuid } from "../Base/UuidGenerator"

export enum DrawableTypes {
    AABBRect
}

export abstract class DrawableComponent implements Component {
    private static _componentId: string = this.name;
    private _assetsPaths: string[];
    private _ownerEntity: Entity;
    private _isActive: boolean = true;
    private _systemAsignedId: Uuid | undefined = undefined;
    
    constructor(owner: Entity) {
        this._assetsPaths = [];
        this._ownerEntity = owner;
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
        return DrawableComponent._componentId;
    }

    abstract getType(): DrawableTypes;

    getAssetsPaths(): string[] {
        return this._assetsPaths;
    }

    protected get assetsPaths(): string[] {
        return this._assetsPaths;
    }
}

export class AABBDrawableComponent extends DrawableComponent {

    private _width: number = 1.0;
    private _height: number = 1.0;
    private _assetPath: string;

    constructor(entity: Entity, texturePath: string) {
        super(entity);
        this.assetsPaths.push(texturePath);
        this._assetPath = texturePath;
    }

    getType(): DrawableTypes {
        return DrawableTypes.AABBRect;
    }
}

export class DrawableSystem extends System<DrawableComponent> {
    registerComponent(component: DrawableComponent): DrawableComponent {
        this._registerComponent(component);
        return component;
    }
    unregisterComponent(component: DrawableComponent): DrawableComponent {
        this._unregisterComponent(component);
        return component;
    }
}