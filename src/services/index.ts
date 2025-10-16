// Export tất cả services để dễ import
export { default as authService } from './authService';
export { default as userService } from './userService';
export { default as customerService } from './customerService';
export { default as vehicleService } from './vehicleService';
export { default as appointmentService } from './appointmentService';
export { default as serviceOrderService } from './serviceOrderService';
export { default as serviceCenterService } from './serviceCenterService';
export { default as servicePackageService } from './servicePackageService';
export { default as staffService } from './staffService';

// Export api instance và helper
export { default as api, getErrorMessage } from './api';

// Re-export types
export type { LoginRequest, LoginResponse, ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest } from './authService';
export type { User, RegisterRequest, UpdateUserRequest, UpdateRoleRequest } from './userService';
export type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from './customerService';
export type { CreateVehicleRequest, UpdateVehicleRequest } from './vehicleService';
export type { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest, AvailableSlot } from './appointmentService';
export type { ServiceOrder, CreateServiceOrderRequest, UpdateServiceOrderRequest, AssignTechnicianRequest, UpdateStatusRequest } from './serviceOrderService';
export type { ServiceCenter, CreateServiceCenterRequest, UpdateServiceCenterRequest } from './serviceCenterService';
export type { ServicePackage, CreateServicePackageRequest, UpdateServicePackageRequest } from './servicePackageService';
export type { Staff, CreateStaffRequest, UpdateStaffRequest, UpdateStaffProfileRequest } from './staffService';
