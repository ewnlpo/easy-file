import { calculateFileMD5 } from "@easy-file/shared";

export {
    calculateFileMD5
}


/**
 * 1、分割文件
 */


// 文件切边可以分为按数量切片和按大小切片
// 如果是按数量切片，那么每个切片的大小就是文件大小除以切片数量
// 如果是按大小切片，那么每个切片的大小就是指定的大小
