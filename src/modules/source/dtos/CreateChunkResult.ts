export interface ChunkItem {
    content: string;
    embedding: number[];
}

export interface CreateChunkResult {
    chunks: ChunkItem[];
    tokenCost: number;
}
