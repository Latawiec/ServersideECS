import { Entity } from "./Entity"
import { Uuid } from "./UuidGenerator"

export type MetaName = string;

export interface MetaClass {
    get metaName(): MetaName
}

export abstract class ComponentBase implements MetaClass {
    abstract get metaName(): string;
    
    abstract get isActive(): boolean;
    abstract get ownerEntity(): Entity;
    abstract get systemAsignedId(): Uuid | undefined;
    abstract set systemAsignedId(value: Uuid | undefined);
    abstract get systemMetaName(): MetaName;

}