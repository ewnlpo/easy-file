import { calculateBigFileMD5 } from "./hasher";
self.onmessage = async (event: MessageEvent) => {
    const data = event.data;
    console.log("Worker received:", data);

    const result = await calculateBigFileMD5(data.file, data.chunkSize);

    // 返回结果
    self.postMessage(result);
};

export { }; // 避免 TS 报错：Cannot redeclare block-scoped variable
