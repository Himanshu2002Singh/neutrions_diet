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

// Task types
export type TaskType = 'daily' | 'weekly' | 'monthly' | 'new_user';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
export type DoctorTaskStatus = 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'rejected';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  taskType: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  deadline: string | null;
  nextOccurrence: string | null;
  completedAt: string | null;
  targetCount: number;
  currentCount: number;
  referralTimerMinutes: number;
  lastReferralAt: string | null;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  doctorAssignments?: DoctorTask[];
  countdown?: CountdownInfo;
}

export interface CountdownInfo {
  display: string;
  isExpired: boolean;
  remainingMs: number;
}

export interface DoctorTask {
  id: number;
  taskId: number;
  doctorId: number;
  status: DoctorTaskStatus;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  referralCount: number;
  progress: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  task?: Task;
  countdown?: CountdownInfo;
}

export interface DoctorTaskWithProgress extends DoctorTask {
  progress: number;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

// Referral types
export interface ReferralInfo {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  joinedAt: string;
  referralCode?: string;
  status?: string;
}

export interface DoctorReferralsResponse {
  success: boolean;
  data: {
    totalReferrals: number;
    referrals: ReferralInfo[];
  };
}

