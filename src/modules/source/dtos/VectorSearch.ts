export interface VectorSearchItem {
    sourceChunkId: number;
    chunkText: string;
    score: number;
}

export type VectorSearchResult = VectorSearchItem[];
