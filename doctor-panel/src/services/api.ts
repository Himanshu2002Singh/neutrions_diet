// API service for doctor-panel

import { LoginCredentials, LoginResponse, AssignedUser, HealthProfile } from '../types';

const API_BASE_URL = 'http://localhost:3002/api';

// Token storage keys
const TOKEN_KEY = 'doctor_panel_token';
const USER_KEY = 'doctor_panel_user';

// Save token to localStorage
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Save user to localStorage
export const setUser = (user: object): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Get user from localStorage
export const getUser = (): object | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Remove user from localStorage
export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Login API call
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data: LoginResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  // Save token and user on successful login
  if (data.success) {
    setToken(data.data.token);
    setUser(data.data.admin);
  }

  return data;
};

// Logout function
export const logout = (): void => {
  removeToken();
  removeUser();
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
};

// Get current user
export const getCurrentUser = (): object | null => {
  return getUser();
};

// Get auth header for API calls
export const getAuthHeader = (): HeadersInit => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Make authenticated API request
async function makeAuthenticatedRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// Get users assigned to the logged-in doctor/dietician
export const getAssignedUsers = async (): Promise<{ success: boolean; data: AssignedUser[]; count: number }> => {
  return makeAuthenticatedRequest('/health/doctor/assigned-users');
};

// Get a specific user's health profile
export const getUserHealthProfile = async (userId: number): Promise<{ success: boolean; data: any }> => {
  return makeAuthenticatedRequest(`/health/doctor/user/${userId}/health-profile`);
};

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

// Types for assigned users with health profiles
export interface AssignedUser {
  id: number;
  userName: string;
  email: string;
  phone: string;
  age: number;
  weight: number;
  height: number;
  gender: string;
  activityLevel: string;
  assignedAt: string | null;
  healthProfile: HealthProfile;
}

export interface HealthProfile {
  medicalConditions: string[];
  goals: string[];
  bmi: number;
  bmiCategory: string;
  bmr: number;
  dailyCalories: number;
  idealWeightMin: number;
  idealWeightMax: number;
  dietRecommendation: DietRecommendation | null;
}

export interface DietRecommendation {
  protein: number;
  carbs: number;
  fats: number;
  meals: string;
  foods: string;
  restrictions: string[];
  medicalRecommendations: string[];
}

export interface ProgressData {
  userId: number;
  date: string;
  weight: number;
  bmi: number;
  notes: string;
}

