import React, { useState } from 'react';
import ImageUploader from '../ui/ImageUploader/ImageUploader';

// Ví dụ sử dụng trong form thêm/sửa xe
const VehicleFormExample: React.FC = () => {
  const [vehicleImage, setVehicleImage] = useState<string>('');
  const [vehicleImageFilename, setVehicleImageFilename] = useState<string>('');

  const handleImageUploaded = (imageUrl: string, filename: string) => {
    console.log('Ảnh đã upload:', imageUrl);
    setVehicleImage(imageUrl);
    setVehicleImageFilename(filename);
  };

  const handleImageRemoved = () => {
    console.log('Ảnh đã xóa');
    setVehicleImage('');
    setVehicleImageFilename('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Khi submit form, vehicleImage sẽ chứa URL của ảnh đã upload
    const vehicleData = {
      make: 'VinFast',
      model: 'VF 8',
      year: 2024,
      imageUrl: vehicleImage, // URL ảnh đã upload
      // ... các field khác
    };

    console.log('Dữ liệu xe:', vehicleData);
    // Gọi API để lưu xe với imageUrl
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Thêm ảnh xe</h3>
      
      {/* Component upload ảnh */}
      <ImageUploader
        onImageUploaded={handleImageUploaded}
        onImageRemoved={handleImageRemoved}
        existingImageUrl={vehicleImage} // Nếu đang edit và đã có ảnh
        maxSizeMB={5}
      />

      {/* Hidden input chứa URL ảnh */}
      <input type="hidden" name="imageUrl" value={vehicleImage} />

      <button type="submit">Lưu thông tin xe</button>
    </form>
  );
};

export default VehicleFormExample;
