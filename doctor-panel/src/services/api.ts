

// API service for doctor-panel

// Diet file interface - defined at top to avoid TypeScript hoisting issues
export interface DietFile {
  id: number;
  userId: number;
  doctorId: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = 'https://api.nutreazy.in/api';

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

// Upload diet file for a user
export const uploadDietFile = async (
  userId: number,
  file: File,
  description: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const token = getToken();
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId.toString());
  formData.append('description', description);

  const response = await fetch(`${API_BASE_URL}/health/doctor/upload-diet-file`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload diet file');
  }

  return data;
};

// Get diet files for a user
export const getUserDietFiles = async (userId: number): Promise<{ success: boolean; data: DietFile[] }> => {
  return makeAuthenticatedRequest(`/health/doctor/user/${userId}/diet-files`);
};

// Download a diet file
export const downloadDietFile = async (fileId: number): Promise<{ success: boolean; url?: string }> => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/health/doctor/diet-files/${fileId}/download`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to download file');
  }

  // Get the blob and create a download link
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  
  // Trigger download
  const contentDisposition = response.headers.get('content-disposition');
  let fileName = 'diet-file.pdf';
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
    if (fileNameMatch) {
      fileName = fileNameMatch[1];
    }
  }
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  return { success: true, url };
};

// Delete a diet file
export const deleteDietFile = async (fileId: number): Promise<{ success: boolean; message: string }> => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/health/doctor/diet-files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete file');
  }

  return data;
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

// Chat types and API methods
export interface ChatConversation {
  id: number;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderType: 'user' | 'member';
  message: string;
  read: boolean;
  createdAt: string;
}

// Get all conversations for the logged-in member (doctor/dietitian)
export const getMemberConversations = async (memberId: number): Promise<{ success: boolean; data: ChatConversation[] }> => {
  return makeAuthenticatedRequest(`/chat/member/${memberId}/conversations`);
};

// Get messages for a conversation
export const getMemberChatMessages = async (
  conversationId: number, 
  limit?: number, 
  offset?: number
): Promise<{ 
  success: boolean; 
  data: {
    messages: ChatMessage[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }; 
}> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());
  
  const queryString = params.toString();
  return makeAuthenticatedRequest(`/chat/member/conversation/${conversationId}/messages${queryString ? '?' + queryString : ''}`);
};

// Send a message as member (doctor/dietitian)
export const sendMemberChatMessage = async (
  memberId: number, 
  conversationId: number, 
  message: string
): Promise<{ 
  success: boolean; 
  data: ChatMessage; 
}> => {
  return makeAuthenticatedRequest(`/chat/member/conversation/${memberId}/send`, {
    method: 'POST',
    body: JSON.stringify({
      conversationId,
      message,
      senderType: 'member'
    }),
  });
};

// Mark messages as read
export const markMemberChatMessagesAsRead = async (
  conversationId: number, 
  senderType: 'user' | 'member'
): Promise<{ success: boolean; message: string }> => {
  return makeAuthenticatedRequest(`/chat/member/conversation/${conversationId}/read`, {
    method: 'PUT',
    body: JSON.stringify({ senderType }),
  });
};

// ============================================
// DOCTOR PANEL PROGRESS REPORT API
// ============================================

// Progress summary for all assigned users
export interface TodayFoodItem {
  name: string;
  calories: number;
  portion?: string | null;
}

export interface UserProgressSummary {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  joinedDate: string;
  assignedAt: string | null;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  bmiCategory: string;
  targetCalories: number;
  todayCalories: number;
  todayFoods: TodayFoodItem[];
  weekAvgCalories: number;
  complianceRate: number;
  lastActive: string | null;
  daysActiveLastWeek: number;
}

export interface ProgressSummaryResponse {
  success: boolean;
  data: {
    summary: {
      totalPatients: number;
      activeToday: number;
      avgCompliance: number;
      criticalCases: number;
    };
    users: UserProgressSummary[];
  };
}

// Meal activity for a specific meal
export interface MealItem {
  name: string;
  calories: number;
  portion?: string;
}

export interface MealActivityData {
  id: number;
  mealType: string;
  selectedItems: MealItem[];
  notes: string | null;
  totalCalories: number;
  createdAt: string;
  updatedAt: string;
}

// User meal activities response
export interface UserMealActivitiesResponse {
  success: boolean;
  data: {
    userId: number;
    startDate: string;
    endDate: string;
    activitiesByDate: {
      [date: string]: {
        [mealType: string]: MealActivityData;
      };
    };
    summary: {
      totalDays: number;
      daysWithMeals: number;
      totalCalories: number;
      avgCaloriesPerDay: number;
      targetCalories: number;
      avgComplianceRate: number;
    };
  };
}

// Diet analysis response
export interface DietAnalysisDay {
  date: string;
  target: number;
  actual: number;
  compliance: number;
  mealsTracked: number;
  meals: {
    [mealType: string]: number;
  };
}

export interface MealBreakdown {
  avgCalories: number;
  target: number;
}

export interface DietAnalysisResponse {
  success: boolean;
  data: {
    userId: number;
    period: string;
    currentWeight: number;
    targetCalories: number;
    analysis: {
      avgDailyCalories: number;
      targetCalories: number;
      complianceRate: number;
      daysData: DietAnalysisDay[];
      breakdownByMeal: {
        [mealType: string]: MealBreakdown;
      };
      totalDays: number;
      daysWithData: number;
    };
  };
}

// Get progress summary for all assigned users
export const getDoctorProgressSummary = async (): Promise<ProgressSummaryResponse> => {
  return makeAuthenticatedRequest('/health/doctor/progress-summary');
};

// Get user's meal activities for a date range
export const getDoctorUserMealActivities = async (
  userId: number,
  startDate?: string,
  endDate?: string
): Promise<UserMealActivitiesResponse> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const queryString = params.toString();
  return makeAuthenticatedRequest(`/health/doctor/user/${userId}/meal-activities${queryString ? '?' + queryString : ''}`);
};

// Get user's diet analysis
export const getDoctorUserDietAnalysis = async (
  userId: number,
  period: 'day' | 'week' | 'month' = 'week'
): Promise<DietAnalysisResponse> => {
  return makeAuthenticatedRequest(`/health/doctor/user/${userId}/diet-analysis?period=${period}`);
};

// ============================================
// DOCTOR PANEL TASK MANAGEMENT API
// ============================================

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
  metadata: Record<string, unknown>;
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

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export interface PaginatedDoctorTasks {
  success: boolean;
  data: DoctorTask[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Get tasks assigned to a specific doctor/member
export const getDoctorTasks = async (
  doctorId: number,
  status?: DoctorTaskStatus,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedDoctorTasks> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  return makeAuthenticatedRequest(`/tasks/doctor/${doctorId}?${params.toString()}`);
};

// Update status of a doctor task
export const updateDoctorTaskStatus = async (
  doctorTaskId: number,
  status: DoctorTaskStatus,
  notes?: string,
  progress?: number
): Promise<{ success: boolean; message: string; data: DoctorTask }> => {
  return makeAuthenticatedRequest(`/tasks/doctor/${doctorTaskId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes, progress }),
  });
};

// Get all doctors/members (for admin task assignment)
export const getAllDoctors = async (): Promise<{ success: boolean; data: Array<{
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  category: string | null;
}> }> => {
  return makeAuthenticatedRequest('/tasks/doctors');
};

// Get task statistics (for admin dashboard)
export const getTaskStats = async (): Promise<{ success: boolean; data: TaskStats }> => {
  return makeAuthenticatedRequest('/tasks/stats');
};

// ============================================
// ADMIN TASK MANAGEMENT API (for Admin Dashboard)
// ============================================

export interface CreateTaskRequest {
  title: string;
  description?: string;
  taskType: TaskType;
  priority?: TaskPriority;
  dueDate?: string;
  targetCount?: number;
  metadata?: Record<string, unknown>;
}

export interface PaginatedTasks {
  success: boolean;
  data: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Get all tasks (admin only)
export const getAllTasks = async (
  status?: TaskStatus,
  taskType?: TaskType,
  priority?: TaskPriority,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedTasks> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (taskType) params.append('taskType', taskType);
  if (priority) params.append('priority', priority);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  return makeAuthenticatedRequest(`/tasks?${params.toString()}`);
};

// Create a new task (admin only)
export const createTask = async (taskData: CreateTaskRequest): Promise<{ success: boolean; message: string; data: Task }> => {
  return makeAuthenticatedRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
};

// Get a single task (admin only)
export const getTask = async (taskId: number): Promise<{ success: boolean; data: Task }> => {
  return makeAuthenticatedRequest(`/tasks/${taskId}`);
};

// Update a task (admin only)
export const updateTask = async (
  taskId: number,
  taskData: Partial<CreateTaskRequest>
): Promise<{ success: boolean; message: string; data: Task }> => {
  return makeAuthenticatedRequest(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
};

// Delete a task (admin only - soft delete)
export const deleteTask = async (taskId: number): Promise<{ success: boolean; message: string }> => {
  return makeAuthenticatedRequest(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
};

// Assign a task to a doctor (admin only)
export const assignTaskToDoctor = async (
  taskId: number,
  doctorId: number,
  notes?: string
): Promise<{ success: boolean; message: string; data: DoctorTask }> => {
  return makeAuthenticatedRequest(`/tasks/${taskId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ doctorId, notes }),
  });
};

// ============================================
// DOCTOR PANEL REFERRALS API
// ============================================

export interface ReferralInfo {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  joinedAt: string;
  referralCode: string;
}

export interface DoctorReferralsResponse {
  success: boolean;
  data: {
    totalReferrals: number;
    referrals: ReferralInfo[];
  };
}

// Get referrals for a doctor
export const getDoctorReferrals = async (doctorId: number): Promise<DoctorReferralsResponse> => {
  return makeAuthenticatedRequest(`/tasks/doctor/${doctorId}/referrals`);
};

// Get doctor's referral code
export interface DoctorReferralCodeResponse {
  success: boolean;
  data: {
    referralCode: string;
    doctorName: string;
  };
}

export const getDoctorReferralCode = async (doctorId: number): Promise<DoctorReferralCodeResponse> => {
  return makeAuthenticatedRequest(`/tasks/doctor/${doctorId}/referral-code`);
};

// Create a referral invitation
export interface CreateReferralInviteRequest {
  name: string;
  email: string;
  taskId?: number;
}

export interface CreateReferralInviteResponse {
  success: boolean;
  message: string;
  data: {
    referralCode: string;
    referralId: number;
    doctorName: string;
  };
}

export const createReferralInvite = async (
  doctorId: number,
  data: CreateReferralInviteRequest
): Promise<CreateReferralInviteResponse> => {
  return makeAuthenticatedRequest(`/tasks/doctor/${doctorId}/referral-invite`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};


