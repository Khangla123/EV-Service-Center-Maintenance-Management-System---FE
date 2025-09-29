import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Car, 
  Shield, 
  Settings, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Key,
  Bell,
  CreditCard,
  FileText,
  Download,
  Trash2,
  Plus
} from 'lucide-react';
import MDButton from '../components/ui/MDButton';
import './ProfileManagement.css';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  dateOfBirth: string;
  avatar: string;
  memberSince: string;
  verified: boolean;
}

interface UserVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vin: string;
  purchaseDate: string;
  lastService: string;
  nextService: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
}

const ProfileManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Mock user profile data
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    firstName: 'Nguyễn',
    lastName: 'Văn An',
    email: 'nguyen.van.an@email.com',
    phone: '0123456789',
    address: '123 Đường ABC, Phường XYZ',
    city: 'TP. Hồ Chí Minh',
    dateOfBirth: '1990-05-15',
    avatar: '/assets/images/default-avatar.jpg',
    memberSince: '2023-01-15',
    verified: true
  });

  // Mock vehicles data
  const [vehicles, setVehicles] = useState<UserVehicle[]>([
    {
      id: '1',
      make: 'VinFast',
      model: 'VF8',
      year: 2023,
      licensePlate: '30A-12345',
      color: 'Xanh Đại Dương',
      vin: 'VF8XXXXXXXXXXXXXXX',
      purchaseDate: '2023-03-20',
      lastService: '2024-08-15',
      nextService: '2024-12-15'
    },
    {
      id: '2',
      make: 'VinFast',
      model: 'VF9',
      year: 2024,
      licensePlate: '30B-67890',
      color: 'Trắng Ngọc Trai',
      vin: 'VF9XXXXXXXXXXXXXXX',
      purchaseDate: '2024-01-10',
      lastService: '2024-09-10',
      nextService: '2025-01-10'
    }
  ]);

  // Security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true
  });

  const [editProfile, setEditProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    setEditProfile(profile);
  }, [profile]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditProfile(profile);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = () => {
    setProfile(editProfile);
    setIsEditing(false);
    alert('Thông tin đã được cập nhật thành công!');
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecurityChange = (field: keyof SecuritySettings, value: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    // Simulate password change
    alert('Mật khẩu đã được thay đổi thành công!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatar = e.target?.result as string;
        setProfile(prev => ({ ...prev, avatar }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phương tiện này?')) {
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const renderPersonalInfo = () => (
    <div className="profile-section">
      <div className="section-header">
        <h3>Thông tin cá nhân</h3>
        <MDButton
          variant="outlined"
          onClick={handleEditToggle}
          className="edit-btn"
        >
          {isEditing ? <X size={16} /> : <Edit3 size={16} />}
          {isEditing ? 'Hủy' : 'Chỉnh sửa'}
        </MDButton>
      </div>

      <div className="avatar-section">
        <div className="avatar-container">
          <img 
            src={profile.avatar} 
            alt="Avatar" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/default-avatar.jpg';
            }}
          />
          {isEditing && (
            <label className="avatar-upload">
              <Camera size={20} />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload}
                hidden 
              />
            </label>
          )}
        </div>
        <div className="user-status">
          <h2>{profile.firstName} {profile.lastName}</h2>
          <div className="verification-badge">
            {profile.verified && <Shield size={16} color="#10B981" />}
            <span>{profile.verified ? 'Đã xác thực' : 'Chưa xác thực'}</span>
          </div>
          <p>Thành viên từ {formatDate(profile.memberSince)}</p>
        </div>
      </div>

      <div className="profile-form">
        <div className="form-row">
          <div className="form-group">
            <label>Họ</label>
            {isEditing ? (
              <input
                type="text"
                value={editProfile.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
              />
            ) : (
              <div className="form-value">
                <User size={16} />
                {profile.firstName}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Tên</label>
            {isEditing ? (
              <input
                type="text"
                value={editProfile.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
            ) : (
              <div className="form-value">
                <User size={16} />
                {profile.lastName}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          {isEditing ? (
            <input
              type="email"
              value={editProfile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          ) : (
            <div className="form-value">
              <Mail size={16} />
              {profile.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Số điện thoại</label>
          {isEditing ? (
            <input
              type="tel"
              value={editProfile.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          ) : (
            <div className="form-value">
              <Phone size={16} />
              {profile.phone}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          {isEditing ? (
            <input
              type="text"
              value={editProfile.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          ) : (
            <div className="form-value">
              <MapPin size={16} />
              {profile.address}
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Thành phố</label>
            {isEditing ? (
              <select
                value={editProfile.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              >
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Hải Phòng">Hải Phòng</option>
                <option value="Cần Thơ">Cần Thơ</option>
              </select>
            ) : (
              <div className="form-value">
                <MapPin size={16} />
                {profile.city}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Ngày sinh</label>
            {isEditing ? (
              <input
                type="date"
                value={editProfile.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            ) : (
              <div className="form-value">
                <Calendar size={16} />
                {formatDate(profile.dateOfBirth)}
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="form-actions">
            <MDButton
              variant="filled"
              onClick={handleSaveProfile}
              className="save-btn"
            >
              <Save size={16} />
              Lưu thay đổi
            </MDButton>
          </div>
        )}
      </div>
    </div>
  );

  const renderVehicles = () => (
    <div className="profile-section">
      <div className="section-header">
        <h3>Phương tiện của tôi</h3>
        <MDButton
          variant="filled"
          className="add-vehicle-btn"
        >
          <Plus size={16} />
          Thêm xe
        </MDButton>
      </div>

      <div className="vehicles-grid">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="vehicle-card">
            <div className="vehicle-header">
              <div className="vehicle-info">
                <Car size={20} />
                <h4>{vehicle.make} {vehicle.model} {vehicle.year}</h4>
              </div>
              <button 
                className="delete-vehicle-btn"
                onClick={() => handleDeleteVehicle(vehicle.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="vehicle-details">
              <div className="detail-item">
                <span>Biển số:</span>
                <strong>{vehicle.licensePlate}</strong>
              </div>
              <div className="detail-item">
                <span>Màu sắc:</span>
                <strong>{vehicle.color}</strong>
              </div>
              <div className="detail-item">
                <span>VIN:</span>
                <strong>{vehicle.vin}</strong>
              </div>
              <div className="detail-item">
                <span>Ngày mua:</span>
                <strong>{formatDate(vehicle.purchaseDate)}</strong>
              </div>
              <div className="detail-item">
                <span>Bảo dưỡng cuối:</span>
                <strong>{formatDate(vehicle.lastService)}</strong>
              </div>
              <div className="detail-item">
                <span>Bảo dưỡng tiếp theo:</span>
                <strong className="next-service">{formatDate(vehicle.nextService)}</strong>
              </div>
            </div>

            <div className="vehicle-actions">
              <MDButton variant="outlined" size="small">
                <FileText size={14} />
                Xem lịch sử
              </MDButton>
              <MDButton variant="filled" size="small">
                <Calendar size={14} />
                Đặt lịch
              </MDButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="profile-section">
      <div className="section-header">
        <h3>Bảo mật & Cài đặt</h3>
      </div>

      <div className="security-content">
        <div className="password-section">
          <h4>Thay đổi mật khẩu</h4>
          <div className="password-form">
            <div className="form-group">
              <label>Mật khẩu hiện tại</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>Mật khẩu mới</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Xác nhận mật khẩu mới</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
            </div>

            <MDButton
              variant="filled"
              onClick={handlePasswordChange}
              className="change-password-btn"
            >
              <Key size={16} />
              Thay đổi mật khẩu
            </MDButton>
          </div>
        </div>

        <div className="settings-section">
          <h4>Cài đặt thông báo</h4>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <Shield size={16} />
                <div>
                  <span>Xác thực 2 bước</span>
                  <p>Tăng cường bảo mật cho tài khoản</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorEnabled}
                  onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <Mail size={16} />
                <div>
                  <span>Thông báo Email</span>
                  <p>Nhận thông báo qua email</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={securitySettings.emailNotifications}
                  onChange={(e) => handleSecurityChange('emailNotifications', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <Phone size={16} />
                <div>
                  <span>Thông báo SMS</span>
                  <p>Nhận thông báo qua tin nhắn</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={securitySettings.smsNotifications}
                  onChange={(e) => handleSecurityChange('smsNotifications', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <Bell size={16} />
                <div>
                  <span>Email Marketing</span>
                  <p>Nhận thông tin khuyến mãi và tin tức</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={securitySettings.marketingEmails}
                  onChange={(e) => handleSecurityChange('marketingEmails', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="data-section">
          <h4>Dữ liệu tài khoản</h4>
          <div className="data-actions">
            <MDButton variant="outlined" className="export-btn">
              <Download size={16} />
              Xuất dữ liệu
            </MDButton>
            <MDButton variant="outlined" className="delete-account-btn">
              <Trash2 size={16} />
              Xóa tài khoản
            </MDButton>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="profile-management">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Quản lý hồ sơ</h1>
          <p>Quản lý thông tin cá nhân, phương tiện và cài đặt bảo mật</p>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => handleTabChange('personal')}
          >
            <User size={16} />
            Thông tin cá nhân
          </button>
          <button
            className={`tab-button ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => handleTabChange('vehicles')}
          >
            <Car size={16} />
            Phương tiện
          </button>
          <button
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => handleTabChange('security')}
          >
            <Shield size={16} />
            Bảo mật
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'vehicles' && renderVehicles()}
          {activeTab === 'security' && renderSecurity()}
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;