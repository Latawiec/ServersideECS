import { Entity } from "./Entity"
import { Uuid } from "./UuidGenerator"

export type MetaName = string;

export interface MetaClass {
    get metaName(): MetaName
}

export interface ComponentBase extends MetaClass {
    get isActive(): boolean;
    get ownerEntity(): Entity;
    get systemAsignedId(): Uuid | undefined;
    set systemAsignedId(value: Uuid | undefined);
    get systemMetaName(): MetaName;
}