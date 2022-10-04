import { Entity } from "./Entity"
import { MetaClass, MetaName } from "./MetaName";
import { Uuid } from "./UuidGenerator"

export abstract class ComponentBase implements MetaClass {
    public isActive = true;
    private _systemAsignedId: Uuid;
    private _ownerEntity: Entity;

    constructor(owner: Entity) {
        const world = owner.world;
        this._systemAsignedId = world.registerComponent(owner, this);
        this._ownerEntity = owner;
    }

    unregister() {
        const world = this._ownerEntity.world;
        world.unregisterComponent(this);
    }

    get systemAsignedId(): Uuid {
        return this._systemAsignedId;
    }
    
    get ownerEntity(): Entity {
        return this._ownerEntity
    }

    abstract get systemMetaName(): MetaName;
    abstract get metaName(): string;
}