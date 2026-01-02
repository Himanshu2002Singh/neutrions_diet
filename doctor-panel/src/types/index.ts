// Auth types for doctor-panel

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'member';
  category: 'doctor' | 'dietitian' | null;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: AdminUser;
    token: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

// User types for dashboard components
export interface User {
  id: number;
  name: string;
  age: number;
  weight: string;
  height: string;
  phone: string;
  email: string;
  address: string;
  medicalHistory: string;
  currentMedication: string;
  dietPlan: string;
}

export interface ProgressData {
  userId: number;
  date: string;
  weight: number;
  bmi: number;
  notes: string;
}

