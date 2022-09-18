

export interface Serializable {
    serialize(output: Record<string, any>): Record<string, any>
}