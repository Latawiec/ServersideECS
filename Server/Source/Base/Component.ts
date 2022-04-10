import { Entity } from "./Entity"
import { Uuid } from "./UuidGenerator"

export type MetaName = string;

export interface MetaClass {
    get metaName(): MetaName
}

export interface Component extends MetaClass {
    get isActive(): boolean;
    get ownerEntity(): Entity;
    get systemAsignedId(): Uuid | undefined;
    set systemAsignedId(value: Uuid | undefined);
}