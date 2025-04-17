import SparkMD5 from 'spark-md5';

// 默认切片大小 10MB
const DEFAULT_CHUNK_SIZE = 1024 * 1024 * 10; // 10MB
/**
 * 分割文件
 * @param file 要切分的文件
 * @param chunkSize 切片大小 单位MB
 * @returns 切片数组
 */
export function splitChunks(file: File, chunkSize: number = DEFAULT_CHUNK_SIZE) {
    // 分片数量
    const chunkCount = Math.ceil(file.size / chunkSize),
        chunks = [];
    for (let i = 0; i < chunkCount; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        chunks.push(file.slice(start, end));
    }
    return chunks;
};

/**
 * 计算文件MD5
 * @param file 文件对象
 * @returns md5值
 */
export async function calculateFileMD5(file: File) {
    const spark = new SparkMD5.ArrayBuffer();
    console.log('[MD5] 开始整块读取...');
    const start = Date.now();
    const buffer = await file.arrayBuffer();
    spark.append(buffer);
    const end = Date.now();
    console.log(`[MD5] 计算完成（整块）耗时：${end - start}ms`);
    return spark.end();
}

/**
 * 计算大文件MD5
 * @param file 文件对象
 * @param chunkSize 切片大小 单位MB
 * @returns md5值
 */
export async function calculateBigFileMD5(file: File, chunkSize: number = DEFAULT_CHUNK_SIZE) {
    const chunks = splitChunks(file, chunkSize);
    const spark = new SparkMD5.ArrayBuffer();
    console.log('[MD5] 使用切片计算...');
    const start = Date.now();
    const bufferList = await Promise.all(chunks.map(chunk => chunk.arrayBuffer()))
    for (let i = 0; i < bufferList.length; i++) {
        const buffer = bufferList[i];
        spark.append(buffer);
    }
    const end = Date.now();
    console.log(`[MD5] 计算完成（分片）耗时：${end - start}ms`);
    return spark.end();
}
