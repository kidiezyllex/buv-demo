import { IEmployee } from './employee';

export type UserRole = 'admin' | 'employee' | 'customer' | 'driver';
export type DriverStatus = 'PENDING' | 'APPROVED' | 'LOCKED' | 'REJECTED';


export interface IUser {
  id: string;
  _id?: string;
  username: string;
  fullName: string;
  employeeName: string;
  role: UserRole | string;
  user: IEmployee;
  permissions: string[];
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields kept for compatibility if needed
  avatar?: string;
  phoneNumber?: string;
}

export interface IAuthResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: IUser;
  };
  meta: {
    timestamp: string;
    apiVersion: string;
  };
}

export interface IRefreshTokenResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  meta: {
    timestamp: string;
    apiVersion: string;
  };
}

export interface IProfileResponse {
  statusCode: number;
  message: string;
  data: IUser;
  meta: {
    timestamp: string;
    apiVersion: string;
  };
}


export type VehicleType = 'BIKE' | 'VAN' | 'TRUCK';

// Request interfaces for Quản lý người dùng
export interface ICreateUserBody {
  name: string;
  email?: string;
  password?: string;
  phone: string;
  avatar?: string;
  role: UserRole | string;
  active?: boolean;
  // Customer specific
  walletBalance?: number;
  rating?: number;
  fcmToken?: string;
  // Driver specific
  vehicleType?: VehicleType | string;
  plateNumber?: string;
  licenseImage?: string;
  identityNumber?: string;
  identityFrontImage?: string;
  identityBackImage?: string;
  vehicleRegistrationImage?: string;
  drivingLicenseNumber?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  // Legacy or other
  studentId?: string;
  fullName?: string;
  department?: string;
}

export interface IUpdateUserBody {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  avatar?: string;
  role?: UserRole | string;
  active?: boolean;
  // Customer specific
  walletBalance?: number;
  rating?: number;
  fcmToken?: string;
  // Driver specific
  vehicleType?: VehicleType | string;
  plateNumber?: string;
  licenseImage?: string;
  identityNumber?: string;
  identityFrontImage?: string;
  identityBackImage?: string;
  vehicleRegistrationImage?: string;
  drivingLicenseNumber?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  // Legacy or other
  studentId?: string;
  fullName?: string;
  department?: string;
}

// Upload response interface
export interface IUploadResponse {
  statusCode: number;
  message: string;
  data: {
    statusCode: number;
    message: string;
    data: {
      public_id: string;
      url: string;
      width?: number;
      height?: number;
      format?: string;
      bytes?: number;
    };
  };
}

// Driver interfaces
export interface IDriver {
  _id: string;
  userId: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    phone?: string;
    rating?: number;
    avatar?: string;
  };
  plateNumber: string;
  vehicleType: string;
  status: DriverStatus;
  isOnline: boolean;
  rejectionReason?: string;
  adminNote?: string;
  createdAt?: string;
  updatedAt?: string;
}
