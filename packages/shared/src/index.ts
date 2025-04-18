// 获取文件后缀
export function getFileSuffix(fileName: string) {
    const index = fileName.lastIndexOf('.')
    if (index === -1) {
        return ''
    }
    return fileName.substring(index + 1)
}