export interface FileInfo {
  name: string;
  size: string;
  type: string;
  preview?: string;
}

export class FileService {
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static async processFile(file: File): Promise<FileInfo> {
    const fileInfo: FileInfo = {
      name: file.name,
      size: this.formatFileSize(file.size),
      type: file.type,
    }

    if (file.type.startsWith('image/')) {
      fileInfo.preview = URL.createObjectURL(file)
    }

    return fileInfo
  }

  static revokePreview(preview: string): void {
    URL.revokeObjectURL(preview)
  }
} 