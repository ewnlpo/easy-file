import { calculateHashWithWorker } from "./hasher";
import { splitChunks } from './fileChunk';

interface UploadRequestAdatpter {
    checkChunk: (md5: string, index: number) => Promise<boolean>,
    uploadChunk: (chunk: Blob, md5: string, index: number) => Promise<boolean>,
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
    const { file, chunkSize, requestAdapter, onProgress, onSuccess, onError, onComplete } = options;
    try {
        const md5 = await calculateHashWithWorker(file, chunkSize);
        const { chunks, chunkCount } = splitChunks(file, chunkSize);
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            // 检查是否已经上传过
            const isUploaded = await requestAdapter.checkChunk(md5, i)
            if (isUploaded) {
                continue;
            }
            // 上传切片
            await requestAdapter.uploadChunk(chunk, md5, i);
            // 更新进度
            onProgress?.(Math.round((i + 1) / chunkCount * 100));
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
