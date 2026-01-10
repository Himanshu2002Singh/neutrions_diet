// API service for Admin Dashboard
const API_BASE_URL = 'https://api.nutreazy.in';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  subscription: 'Free' | 'Basic' | 'Standard' | 'Premium';
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  referralCount?: number;
  referralCode?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  cancelledReferrals: number;
  uniqueReferrers: number;
  totalReferredUsers: number;
}

export interface Referral {
  id: number;
  referralCode: string;
  status: 'pending' | 'completed' | 'cancelled';
  referredAt?: string;
  createdAt: string;
  referrer?: {
    id: number;
    name: string;
    email: string;
  };
  referredUser?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface UserReferrals {
  user: {
    id: number;
    name: string;
    email: string;
    referralCode?: string;
  };
  referralCount: number;
  referredUsersCount: number;
  referrals: Array<{
    id: number;
    referralCode: string;
    status: string;
    referredAt?: string;
    createdAt: string;
    referredUser?: {
      id: number;
      name: string;
      email: string;
      joinedAt: string;
      isActive: boolean;
    };
  }>;
}

export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'doctor' | 'dietitian';
  category: 'doctor' | 'dietitian' | null;
  isActive: boolean;
  createdAt: string;
}

export interface MemberCreationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'doctor' | 'dietitian';
  phone?: string;
  category?: 'doctor' | 'dietitian';
}

export interface MemberUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: 'doctor' | 'dietitian';
  category?: 'doctor' | 'dietitian' | null;
  phone?: string;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export interface HealthDetails {
  medicalIssues: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: string;
  medicalConditions: string;
  allergies: string;
  medications: string;
  dietaryRestrictions: string;
  bmi: number;
  bmiCategory: string;
  dailyCalories: number;
  dietRecommendations?: {
    protein: string;
    carbs: string;
    fats: string;
    meals: string;
    foods: string;
  };
}

export interface UserWithHealthProfile {
  id: number;
  userName: string;
  email: string;
  phone: string;
  age: number | string;
  plan: string;
  amount: string;
  createdAt: string;
  assignedDieticianId?: number | null;
  assignedAt?: string | null;
  healthDetails: HealthDetails;
}

// User Diet Report Types
export interface AssignedDoctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface DietStatus {
  hasDietFile: boolean;
  dietUploadedAt?: string | null;
  dietFileName?: string | null;
  dietFileId?: number | null;
  status: 'uploaded' | 'pending';
  statusText: string;
}

export interface UserDietReport {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number | string;
  subscription: string;
  assignedDoctor: AssignedDoctor | null;
  assignedAt?: string | null;
  dietStatus: DietStatus;
  createdAt: string;
}

export interface UserDietReportResponse {
  success: boolean;
  message?: string;
  data: UserDietReport[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Task Management API Types
// ============================================

export type TaskType = 'daily' | 'weekly' | 'monthly' | 'new_user';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  taskType: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  targetCount: number;
  currentCount: number;
  metadata: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  taskType: TaskType;
  priority?: TaskPriority;
  dueDate?: string;
  targetCount?: number;
  metadata?: Record<string, unknown>;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  category: string | null;
}

class ApiService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('neutrion-auth-token');
      
      // Debug: log token status
      console.log('API Request:', {
        endpoint,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : null
      });
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Merge custom headers if provided
      if (options?.headers) {
        const customHeaders = options.headers as Record<string, string>;
        Object.assign(headers, customHeaders);
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // User Management API methods (for regular end users)

  // Get all users with pagination and filters
  async getUsers(
    limit: number = 50, 
    offset: number = 0, 
    search?: string,
    status?: string
  ): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(search && { search }),
      ...(status && { status })
    });
    
    return this.makeRequest(`/api/users?${params}`);
  }

  // Get user statistics
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return this.makeRequest('/api/users/stats');
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<ApiResponse<{
    totalUsers: number;
    activeUsers: number;
    totalDietitians: number;
    usersWithHealthProfiles: number;
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    newThisWeek: number;
  }>> {
    return this.makeRequest('/api/users/dashboard/stats');
  }

  // Get a specific user by ID
  async getUser(userId: number): Promise<ApiResponse<User>> {
    return this.makeRequest(`/api/users/${userId}`);
  }

  // Update a user
  async updateUser(userId: number, updateData: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Delete a user (soft delete)
  async deleteUser(userId: number): Promise<ApiResponse<void>> {
    return this.makeRequest(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Member Management API methods

  // Create a new member (doctor or dietician)
  async createMember(memberData: MemberCreationData): Promise<ApiResponse<Member>> {
    return this.makeRequest('/api/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  // Get all members with pagination
  async getMembers(limit: number = 50, offset: number = 0, role?: string): Promise<ApiResponse<Member[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(role && { role })
    });
    
    return this.makeRequest(`/api/members?${params}`);
  }

  // Get a specific member by ID
  async getMember(memberId: number): Promise<ApiResponse<Member>> {
    return this.makeRequest(`/api/members/${memberId}`);
  }

  // Update a member
  async updateMember(memberId: number, updateData: MemberUpdateData): Promise<ApiResponse<Member>> {
    return this.makeRequest(`/api/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Delete a member (soft delete)
  async deleteMember(memberId: number): Promise<ApiResponse<void>> {
    return this.makeRequest(`/api/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  // Get member statistics
  async getMemberStats(): Promise<ApiResponse<{
    totalDoctors: number;
    totalDietitians: number;
    totalActive: number;
    total: number;
  }>> {
    return this.makeRequest('/api/members/stats');
  }

  // Get assignable members (for assignment functionality)
  async getAssignableMembers(role?: string): Promise<ApiResponse<Member[]>> {
    const params = role ? `?role=${role}` : '';
    return this.makeRequest(`/api/members/assignable${params}`);
  }

  // Get unassigned users (users with health profiles but no assigned dietician)
  async getUnassignedUsers(limit: number = 50, offset: number = 0): Promise<ApiResponse<UserWithHealthProfile[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    return this.makeRequest(`/api/health/admin/unassigned-users?${params}`);
  }

  // Assign a dietician to a user
  async assignDieticianToUser(userId: number, dieticianId: number): Promise<ApiResponse<unknown>> {
    return this.makeRequest('/api/health/admin/assign-dietician', {
      method: 'POST',
      body: JSON.stringify({ userId, dieticianId }),
    });
  }

  // Remove assignment (unassign dietician from user)
  async removeUserAssignment(userId: number): Promise<ApiResponse<unknown>> {
    return this.makeRequest('/api/health/admin/remove-assignment', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Get user's assignment status
  async getUserAssignmentStatus(userId: number): Promise<ApiResponse<unknown>> {
    return this.makeRequest(`/api/health/admin/user/${userId}/assignment`);
  }

  // Referral Management API methods (admin)

  // Get all referrals with pagination and filters
  async getAllReferrals(
    limit: number = 50, 
    offset: number = 0, 
    status?: string
  ): Promise<ApiResponse<Referral[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(status && { status })
    });
    
    return this.makeRequest(`/api/referral/admin/all?${params}`);
  }

  // Get referral statistics
  async getReferralStats(): Promise<ApiResponse<ReferralStats>> {
    return this.makeRequest('/api/referral/admin/stats');
  }

  // Get referrals for a specific user
  async getUserReferrals(userId: number): Promise<ApiResponse<UserReferrals>> {
    return this.makeRequest(`/api/referral/admin/user/${userId}`);
  }

  // Health check
  async healthCheck(): Promise<unknown> {
    return this.makeRequest('/health');
  }

  // User Diet Report API methods (admin)

  // Get user diet report - users with assigned doctors and diet upload status
  async getUserDietReport(
    limit: number = 100,
    offset: number = 0
  ): Promise<UserDietReportResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    return this.makeRequest(`/api/health/admin/user-diet-report?${params}`);
  }

  // Download a diet file
  async downloadDietFile(fileId: number): Promise<void> {
    const token = localStorage.getItem('neutrion-auth-token');
    const response = await fetch(`${API_BASE_URL}/api/health/doctor/diet-files/${fileId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    // Get the filename from the Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = 'diet-file.pdf';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match && match[1]) {
        fileName = match[1];
      }
    }

    // Create a blob from the response and trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // ============================================
  // Task Management API Methods
  // ============================================

  // Get all tasks with pagination and filters
  async getAllTasks(
    status?: TaskStatus,
    taskType?: TaskType,
    priority?: TaskPriority,
    page: number = 1
  ): Promise<{ success: boolean; data: Task[]; pagination: { total: number; page: number; limit: number; pages: number } }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(status && { status }),
      ...(taskType && { taskType }),
      ...(priority && { priority })
    });
    return this.makeRequest(`/api/tasks?${params}`);
  }

  // Get a single task by ID
  async getTask(taskId: number): Promise<{ success: boolean; data: Task }> {
    return this.makeRequest(`/api/tasks/${taskId}`);
  }

  // Create a new task
  async createTask(data: CreateTaskRequest): Promise<{ success: boolean; message?: string; data: Task }> {
    return this.makeRequest('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update a task
  async updateTask(taskId: number, data: Partial<CreateTaskRequest>): Promise<{ success: boolean; message?: string; data: Task }> {
    return this.makeRequest(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete a task (soft delete)
  async deleteTask(taskId: number): Promise<{ success: boolean; message?: string }> {
    return this.makeRequest(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Assign a task to a doctor
  async assignTaskToDoctor(taskId: number, doctorId: number, notes?: string): Promise<{ success: boolean; message?: string; data: unknown }> {
    return this.makeRequest(`/api/tasks/${taskId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ doctorId, notes }),
    });
  }

  // Get all doctors (for assignment)
  async getAllDoctors(): Promise<{ success: boolean; data: Doctor[] }> {
    return this.makeRequest('/api/tasks/doctors');
  }

  // Get task statistics
  async getTaskStats(): Promise<{ success: boolean; data: TaskStats }> {
    return this.makeRequest('/api/tasks/stats');
  }
}

// Create a singleton instance
export const apiService = new ApiService();

// ============================================
// Task Management API Functions
// These are standalone exports for convenience
// ============================================

export async function getAllTasks(
  status?: TaskStatus,
  taskType?: TaskType,
  priority?: TaskPriority,
  page: number = 1
) {
  return apiService.getAllTasks(status, taskType, priority, page);
}

export async function getTask(taskId: number) {
  return apiService.getTask(taskId);
}

export async function createTask(data: CreateTaskRequest) {
  return apiService.createTask(data);
}

export async function updateTask(taskId: number, data: Partial<CreateTaskRequest>) {
  return apiService.updateTask(taskId, data);
}

export async function deleteTask(taskId: number) {
  return apiService.deleteTask(taskId);
}

export async function assignTaskToDoctor(taskId: number, doctorId: number, notes?: string) {
  return apiService.assignTaskToDoctor(taskId, doctorId, notes);
}

export async function getAllDoctors() {
  return apiService.getAllDoctors();
}

export async function getTaskStats() {
  return apiService.getTaskStats();
}

// Export the class for testing
export default ApiService;

