import SparkMD5 from 'spark-md5';
import { splitChunks } from './fileChunk';
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
export async function calculateBigFileMD5(file: File, chunkSize: number) {
    const { chunks } = splitChunks(file, chunkSize);
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

/**
 * 使用Web Worker计算文件MD5
 * @param file 文件对象
 * @returns md5值
 */
export function calculateHashWithWorker(file: File, chunkSize: number) {
    return new Promise<string>((resolve, reject) => {
        const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
        worker.postMessage({ file, chunkSize });
        worker.addEventListener('message', (event: MessageEvent) => {
            console.log('Result from worker:', event.data);
            resolve(event.data);
            worker.terminate();
        })
        worker.addEventListener('error', (event: ErrorEvent) => {
            console.log("There is an error with your worker!");
            reject(event);
            worker.terminate();
        })
    })
}