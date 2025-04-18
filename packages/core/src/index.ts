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
    onSuccess?: (result: any) => void, // 上传成功回调
    onError?: (error: any) => void, // 上传失败回调
}

// 创建上传任务
export const createUploadTask = async (options: UploadOptions) => {
    const { file, chunkSize, requestAdapter } = options;
    const md5 = await calculateHashWithWorker(file, chunkSize);
    const { chunks } = splitChunks(file, chunkSize);
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        // 检查是否已经上传过
        const isUploaded = await requestAdapter.checkChunk(md5, i);
        if (isUploaded) {
            continue;
        }
    }
}


/**
 * 1、分割文件
 */


// 文件切边可以分为按数量切片和按大小切片
// 如果是按数量切片，那么每个切片的大小就是文件大小除以切片数量
// 如果是按大小切片，那么每个切片的大小就是指定的大小
