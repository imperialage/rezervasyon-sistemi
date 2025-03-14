export interface Reservation {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  date: string;
  time: string;
  endTime: string;
  guests: number;
  childCount: number;
  notes: string;
  status: 'aktif' | 'iptal';
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  updateType?: 'bilgi' | 'masa' | 'durum';
  salon?: string;
  masa?: string;
  history?: ReservationHistory[];
}

export interface ReservationHistory {
  id: string;
  timestamp: string;
  updatedBy: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface NetGsmConfig {
  usercode: string;
  password: string;
  msgheader: string;
  baseUrl?: string;
}

export interface NetGsmResponse {
  code: string;
  message: string;
  success: boolean;
}

export interface SMSMessage {
  phoneNumber: string;
  message: string;
  startDate?: string;  // dd/MM/yyyy
  startTime?: string;  // HH:mm
}

export interface SMSResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  isActive: boolean;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type UserRole = 'superadmin' | 'admin' | 'editor' | 'reader';

export interface UserPermissions {
  canManageUsers: boolean;
  canCreateReservations: boolean;
  canEditReservations: boolean;
  canViewReservations: boolean;
  canManageSystem: boolean;
}

export const USER_ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  superadmin: {
    canManageUsers: true,
    canCreateReservations: true,
    canEditReservations: true,
    canViewReservations: true,
    canManageSystem: true
  },
  admin: {
    canManageUsers: true,
    canCreateReservations: true,
    canEditReservations: true,
    canViewReservations: true,
    canManageSystem: false
  },
  editor: {
    canManageUsers: false,
    canCreateReservations: true,
    canEditReservations: true,
    canViewReservations: true,
    canManageSystem: false
  },
  reader: {
    canManageUsers: false,
    canCreateReservations: false,
    canEditReservations: false,
    canViewReservations: true,
    canManageSystem: false
  }
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Süper Admin',
  admin: 'Yönetici',
  editor: 'Editör',
  reader: 'Okuyucu'
};