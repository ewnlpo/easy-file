import { DEFAULT_CHUNK_SIZE, MAX_CHUNK_COUNT } from "./constants";

/**
 * 分割文件
 * @param file 要切分的文件
 * @param chunkSize 切片大小 单位MB
 * @returns 切片数组
 */
export function splitChunks(file: File, chunkSize: number = DEFAULT_CHUNK_SIZE) {
    // 分片数量
    let chunkCount = Math.ceil(file.size / chunkSize),
        chunks = [];

    if (chunkCount > MAX_CHUNK_COUNT) {
        chunkCount = MAX_CHUNK_COUNT;
        chunkSize = Math.ceil(file.size / chunkCount);
    }

    for (let i = 0; i < chunkCount; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        chunks.push(file.slice(start, end));
    }
    return {
        chunks,
        chunkCount,
        chunkSize
    };
};

