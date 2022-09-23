

export interface Serializable {
    serialize(): Record<string, any> | undefined
}