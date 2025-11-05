import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import fileUploadService from '../../../services/fileUploadService';
import { MDButton } from '../index';
import './ImageUploader.css';

interface ImageUploaderProps {
  onImageUploaded?: (imageUrl: string, filename: string) => void;
  onImageRemoved?: () => void;
  existingImageUrl?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  onImageRemoved,
  existingImageUrl,
  maxSizeMB = 5,
  disabled = false,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(existingImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = fileUploadService.validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'File không hợp lệ');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const response = await fileUploadService.uploadFile(file);
      
      setUploadedFilename(response.filename);
      const fullUrl = fileUploadService.getFileUrl(response.filename);
      
      if (onImageUploaded) {
        onImageUploaded(fullUrl, response.filename);
      }

      console.log('✅ Image uploaded:', response);
    } catch (err: any) {
      console.error('❌ Upload error:', err);
      setError(err?.response?.data?.error || 'Lỗi khi upload ảnh');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (uploadedFilename) {
      try {
        await fileUploadService.deleteFile(uploadedFilename);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    setImagePreview(null);
    setUploadedFilename(null);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="image-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {!imagePreview ? (
        <div 
          className={`upload-placeholder ${disabled ? 'disabled' : ''}`}
          onClick={handleClick}
        >
          <ImageIcon size={48} className="upload-icon" />
          <p className="upload-text">Click để chọn ảnh</p>
          <p className="upload-hint">JPG, PNG, GIF, WEBP (tối đa {maxSizeMB}MB)</p>
          {uploading && <div className="uploading-spinner">Đang upload...</div>}
        </div>
      ) : (
        <div className="image-preview-container">
          <img src={imagePreview} alt="Preview" className="image-preview" />
          {!disabled && (
            <button
              className="remove-image-btn"
              onClick={handleRemoveImage}
              disabled={uploading}
              type="button"
            >
              <X size={20} />
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
