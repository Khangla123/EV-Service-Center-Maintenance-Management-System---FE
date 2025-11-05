import api from './api';

export interface UploadResponse {
  success: boolean;
  filename: string;
  url: string;
  size: number;
}

export interface MultipleUploadResponse {
  uploadedFiles: UploadResponse[];
  errors: string[];
  totalSuccess: number;
  totalFailed: number;
}

class FileUploadService {
  /**
   * Upload một file ảnh
   */
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload nhiều file ảnh
   */
  async uploadMultipleFiles(files: File[]): Promise<MultipleUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post<MultipleUploadResponse>('/files/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Lấy URL đầy đủ của file
   */
  getFileUrl(filename: string): string {
    // URL sẽ là: http://localhost:8080/api/v1/files/{filename}
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';
    return `${baseUrl}/files/${filename}`;
  }

  /**
   * Xóa file
   */
  async deleteFile(filename: string): Promise<void> {
    await api.delete(`/files/${filename}`);
  }

  /**
   * Validate file trước khi upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File không được vượt quá 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)' };
    }

    return { valid: true };
  }
}

const fileUploadService = new FileUploadService();
export default fileUploadService;
