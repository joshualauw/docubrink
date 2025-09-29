export interface VectorSearchItem {
    sourceChunkId: number;
    content: string;
    score: number;
}

export type VectorSearchResult = VectorSearchItem[];
