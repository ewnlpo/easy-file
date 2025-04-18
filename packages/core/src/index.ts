import { DEFAULT_CHUNK_SIZE } from "./constants";
import { getFileSuffix } from "@easy-file/shared";
import { calculateHashWithWorker } from "./hasher";
import { splitChunks } from './fileChunk';
interface UploadRequestAdatpter {
    checkChunk: (hash: string, index: number) => Promise<boolean>,
    uploadChunk: (chunk: Blob, filename: string) => Promise<boolean>,
    mergeChunks: () => Promise<boolean>,
}
interface UploadOptions {
    file: File,
    chunkSize?: number,
    requestAdapter: UploadRequestAdatpter,
    onProgress?: (progress: number) => void, // 上传进度回调
    onSuccess?: () => void, // 上传成功回调
    onError?: (error: any) => void, // 上传失败回调
    onComplete?: () => void, // 上传完成回调
}

// 创建上传任务
export const createUploadTask = async (options: UploadOptions) => {
    const { file, chunkSize = DEFAULT_CHUNK_SIZE, requestAdapter, onProgress, onSuccess, onError, onComplete } = options;
    const suffix = getFileSuffix(file.name);
    if (suffix === '') {
        throw new Error('文件格式错误');
    }
    try {
        const [hash, { chunks, chunkCount }] = await Promise.all([
            calculateHashWithWorker(file, chunkSize),
            splitChunks(file, chunkSize),
        ]);

        const concurrency = 3; // 并发上传数量
        const uploadQueue = []; // 任务队列
        // 创建上传任务队列
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const uploadTask = async () => {
                // 检查是否已经上传过
                const isUploaded = await requestAdapter.checkChunk(hash, i)
                // 如果没有上传过，就上传切片
                if (!isUploaded) {
                    // 上传切片
                    await requestAdapter.uploadChunk(chunk, `${hash}_${i + 1}.${suffix}`);
                }
                // 更新进度
                onProgress?.(Math.round((i + 1) / chunkCount * 100));
            }

            uploadQueue.push(uploadTask);
        }

        // 并发上传
        while (uploadQueue.length > 0) {
            const tasks = uploadQueue.splice(0, concurrency);
            await Promise.all(tasks.map(task => task()));
        }

        // 合并切片
        await requestAdapter.mergeChunks();
        // 上传成功
        onSuccess?.();
    } catch (error) {
        // 上传失败
        onError?.(error);
    } finally {
        // 上传完成
        onComplete?.();
    }
}


/**
 * 1、分割文件
 */


// 文件切边可以分为按数量切片和按大小切片
// 如果是按数量切片，那么每个切片的大小就是文件大小除以切片数量
// 如果是按大小切片，那么每个切片的大小就是指定的大小
