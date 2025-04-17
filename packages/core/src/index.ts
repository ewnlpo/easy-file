import { isObject } from "@easy-file/shared";

// 默认切片大小 10MB
const DEFAULT_CHUNK_SIZE = 1024 * 1024 * 10; // 10MB

/**
 * 分割文件
 * @param file 要切分的文件
 * @param chunkSize 切片大小 单位MB
 * @returns 切片数组
 */
export function splitChunks(file: File, chunkSize: number = DEFAULT_CHUNK_SIZE) {
    debugger
    // 分片数量
    const chunkCount = Math.ceil(file.size / chunkSize);
    console.log("chunkCount", chunkCount);

}






// 文件切边可以分为按数量切片和按大小切片
// 如果是按数量切片，那么每个切片的大小就是文件大小除以切片数量
// 如果是按大小切片，那么每个切片的大小就是指定的大小
