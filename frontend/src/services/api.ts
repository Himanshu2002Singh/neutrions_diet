// API service for backend communication
// Use import.meta.env for Vite environment variables
const API_BASE_URL =  'http://localhost:3002';

export interface HealthFormData {
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: string;
  medicalConditions: string;
  goals: string;
}

export interface BMICalculation {
  bmi: number;
  category: string;
  bmr: number;
  dailyCalories: number;
  idealWeight: [number, number];
  color: string;
}

export interface HealthSubmissionResponse {
  success: boolean;
  message: string;
  data: {
    healthProfile: any;
    bmiCalculation: BMICalculation;
    dietRecommendation?: any;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
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

// Referral interfaces
export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  cancelledReferrals: number;
  uniqueReferrers: number;
  totalReferredUsers: number;
}

// Food item data interface for meal logging
export interface FoodItemData {
  name: string;
  portion: string;
  imageUrl?: string;
  calories: number;
  macros?: {
    protein: number;
    carbs: number;
    fats: number;
  };
  notes?: string;
}

export interface UserReferrals {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  referredUsers: Array<{
    id: number;
    name: string;
    email: string;
    joinedAt: string;
    status: string;
    rewardStatus: string;
  }>;
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
        ...options?.headers,
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
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

  // Submit health form data
  async submitHealthForm(userId: number, formData: HealthFormData): Promise<HealthSubmissionResponse> {
    return this.makeRequest<HealthSubmissionResponse>('/api/health/submit/' + userId, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  // Get user health profile
  async getHealthProfile(userId: number): Promise<any> {
    return this.makeRequest('/api/health/profile/' + userId);
  }

  // Get health profile history
  async getHealthHistory(userId: number): Promise<any> {
    return this.makeRequest('/api/health/profile/' + userId + '/history');
  }

  // Calculate BMI only
  async calculateBMI(formData: HealthFormData): Promise<{ data: { bmiCalculation: BMICalculation } }> {
    return this.makeRequest('/api/bmi/calculate', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  // Get BMI categories
  async getBMICategories(): Promise<any> {
    return this.makeRequest('/api/bmi/categories');
  }

  // Get diet recommendations
  async getDietRecommendations(userId: number): Promise<any> {
    return this.makeRequest('/api/diet/recommendations/' + userId);
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.makeRequest('/health');
  }

  // Admin Dashboard API methods
  
  // Get all users with their health profiles for admin dashboard
  async getUsersWithHealthProfiles(limit: number = 50, offset: number = 0): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      userName: string;
      email: string;
      phone: string;
      age: number | string;
      plan: string;
      amount: string;
      createdAt: string;
      healthDetails: {
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
        dietRecommendations?: any;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.makeRequest(`/api/health/admin/users-with-profiles?limit=${limit}&offset=${offset}`);
  }

  // Get a specific user's health profile for admin dashboard
  async getUserHealthProfile(userId: number): Promise<{
    success: boolean;
    data: {
      id: number;
      userName: string;
      email: string;
      phone: string;
      age: number | string;
      plan: string;
      amount: string;
      createdAt: string;
      healthDetails: {
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
        dietRecommendations?: any;
      };
    };
  }> {
    return this.makeRequest(`/api/health/admin/user/${userId}/profile`);
  }

  // Member Management API methods

  // Create a new member (doctor or dietician)
  async createMember(memberData: MemberCreationData): Promise<{
    success: boolean;
    message: string;
    data: Member;
  }> {
    return this.makeRequest('/api/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  // Get all members with pagination
  async getMembers(limit: number = 50, offset: number = 0, role?: string): Promise<{
    success: boolean;
    data: Member[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(role && { role })
    });
    
    return this.makeRequest(`/api/members?${params}`);
  }

  // Get a specific member by ID
  async getMember(memberId: number): Promise<{
    success: boolean;
    data: Member;
  }> {
    return this.makeRequest(`/api/members/${memberId}`);
  }

  // Update a member
  async updateMember(memberId: number, updateData: MemberUpdateData): Promise<{
    success: boolean;
    message: string;
    data: Member;
  }> {
    return this.makeRequest(`/api/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Delete a member (soft delete)
  async deleteMember(memberId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.makeRequest(`/api/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  // Get member statistics
  async getMemberStats(): Promise<{
    success: boolean;
    data: {
      totalDoctors: number;
      totalDietitians: number;
      totalActive: number;
      total: number;
    };
  }> {
    return this.makeRequest('/api/members/stats');
  }

  // Get assignable members (for assignment functionality)
  async getAssignableMembers(role?: string): Promise<{
    success: boolean;
    data: Member[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      pages: number;
    };
  }> {
    const params = role ? `?role=${role}` : '';
    return this.makeRequest(`/api/members/assignable${params}`);
  }

  // Referral Management API methods (for regular users)

  // Get user's referral code
  async getMyReferralCode(): Promise<{
    success: boolean;
    data: {
      referralCode: string;
      referralLink: string;
    };
  }> {
    return this.makeRequest('/api/referral/my-code');
  }

  // Generate a new referral code
  async generateReferralCode(): Promise<{
    success: boolean;
    message: string;
    data: {
      referralCode: string;
      referralLink: string;
    };
  }> {
    return this.makeRequest('/api/referral/generate', {
      method: 'POST',
    });
  }

  // Apply a referral code (when signing up)
  async applyReferralCode(referralCode: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.makeRequest('/api/referral/apply', {
      method: 'POST',
      body: JSON.stringify({ referralCode }),
    });
  }

  // Get user's referral statistics
  async getMyReferrals(): Promise<{
    success: boolean;
    data: UserReferrals;
  }> {
    return this.makeRequest('/api/referral/my-referrals');
  }

  // Get referral stats
  async getReferralStats(): Promise<{
    success: boolean;
    data: ReferralStats;
  }> {
    return this.makeRequest('/api/referral/stats');
  }

  // Meal Activity API methods (for personalized diet tracking)

  // Save user's daily meal activity
  async saveMealActivity(userId: number, data: {
    date: string;
    mealType: string;
    selectedItems: FoodItemData[];
    notes?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      id: number;
      userId: number;
      date: string;
      mealType: string;
      selectedItems: FoodItemData[];
      notes: string | null;
      totalCalories?: number;
    };
  }> {
    return this.makeRequest('/api/health/meal-activity/save', {
      method: 'POST',
      body: JSON.stringify({ ...data, userId }),
    });
  }

  // Get user's meal activity for a specific date
  async getMealActivityByDate(userId: number, date: string): Promise<{
    success: boolean;
    data: {
      userId: number;
      date: string;
      activities: Record<string, {
        id: number;
        selectedItems: FoodItemData[];
        notes: string | null;
        createdAt: string;
        updatedAt: string;
      }>;
    };
  }> {
    return this.makeRequest(`/api/health/meal-activity/${userId}/${date}`);
  }

  // Get user's meal activities for a date range
  async getMealActivities(userId: number, startDate?: string, endDate?: string): Promise<{
    success: boolean;
    data: {
      userId: number;
      startDate: string;
      endDate: string;
      activitiesByDate: Record<string, Record<string, {
        id: number;
        selectedItems: FoodItemData[];
        notes: string | null;
        createdAt: string;
        updatedAt: string;
      }>>;
    };
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    return this.makeRequest(`/api/health/meal-activity/${userId}${queryString ? '?' + queryString : ''}`);
  }

  // Diet Files / Menu Items API methods

  // Get all diet files (menu items) from backend
  async getDietFiles(category?: string): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      name: string;
      description: string;
      imageUrl: string;
      category: string;
      calories: number;
      carbs: number;
      protein: number;
      fats: number;
      difficulty: string;
      healthScore: number;
      prepTime: number;
      mealType: string;
      isFeatured: boolean;
    }>;
  }> {
    const params = category ? `?category=${category}` : '';
    return this.makeRequest(`/api/diet/files${params}`);
  }

  // Get a specific diet file by ID
  async getDietFile(dietFileId: number): Promise<{
    success: boolean;
    data: {
      id: number;
      name: string;
      description: string;
      imageUrl: string;
      category: string;
      calories: number;
      carbs: number;
      protein: number;
      fats: number;
      difficulty: string;
      healthScore: number;
      prepTime: number;
      mealType: string;
      ingredients: string[];
      steps: string[];
      isFeatured: boolean;
    };
  }> {
    return this.makeRequest(`/api/diet/files/${dietFileId}`);
  }

  // Get featured diet file
  async getFeaturedDietFile(): Promise<{
    success: boolean;
    data: {
      id: number;
      name: string;
      description: string;
      imageUrl: string;
      category: string;
      calories: number;
      carbs: number;
      protein: number;
      fats: number;
      difficulty: string;
      healthScore: number;
      prepTime: number;
      mealType: string;
      isFeatured: boolean;
    };
  }> {
    return this.makeRequest('/api/diet/files/featured');
  }

// Get personalized diet plan for user based on their profile
  async getPersonalizedDietPlan(userId: number): Promise<{
    success: boolean;
    data: {
      userId: number;
      userName: string;
      profile: {
        age: number;
        weight: number;
        height: number;
        bmiCategory: string;
        target: string;
      };
      nutritionTargets: {
        calories: string;
        protein: string;
        fiber: string;
        fat: string;
        carbs: string;
      };
      dailySchedule: Array<{
        time: string;
        mealType: string;
        title: string;
        description?: string;
        options: Array<{
          name: string;
          portion: string;
          imageUrl: string;
          calories: number;
          macros?: {
            protein: number;
            carbs: number;
            fats: number;
          };
          notes?: string;
        }>;
        tips?: string;
      }>;
      lateNightOptions: Array<{
        name: string;
        portion: string;
        imageUrl: string;
        calories: number;
        macros?: {
          protein: number;
          carbs: number;
          fats: number;
        };
      }>;
      importantPoints?: string[];
      portionSizeReference?: Record<string, string>;
      goals?: string[];
    };
  }> {
    return this.makeRequest(`/api/health/diet/personalized/${userId}`);
  }

  // Get all dashboard data for a user in one call
  async getDashboardData(userId: number): Promise<{
    success: boolean;
    data: {
      user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        avatar: string | null;
        joinedDate: string;
      };
      health: {
        age: number;
        weight: number;
        height: number;
        gender: string;
        activityLevel: string;
        medicalConditions: string[];
        goals: string[];
        targetWeight: number | null;
      } | null;
      bmi: {
        bmi: number;
        category: string;
        bmr: number;
        dailyCalories: number;
      } | null;
      assignedDoctor: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        role: string;
        assignedAt: string | null;
      } | null;
      dietPlan: {
        id: number;
        name: string;
        goals: string[];
        nutritionTargets: {
          calories: string;
          protein: string;
          fiber: string;
          fat: string;
          carbs: string;
        } | null;
        startDate: string;
        status: string;
      } | null;
      weeklyProgress: {
        totalMealsTracked: number;
        daysWithMeals: number;
        avgMealsPerDay: string;
        byDate: Record<string, Array<{
          mealType: string;
          items: string[];
          notes: string | null;
        }>>;
      };
    };
  }> {
    return this.makeRequest(`/api/health/dashboard/${userId}`);
  }

  // ============ Chat API Methods ============

  // Get chat with assigned dietitian for a user
  async getUserDietitianChat(userId: number): Promise<{
    success: boolean;
    data: {
      conversation: {
        id: number;
        userId: number;
        memberId: number;
        createdAt: string;
      };
      dietitian: {
        id: number;
        name: string;
        email: string;
        category: string;
        phone: string | null;
      };
      unreadCount: number;
    };
  }> {
    return this.makeRequest(`/api/chat/user/${userId}/dietitian`);
  }

  // Get messages for a conversation
  async getChatMessages(conversationId: number, limit?: number, offset?: number): Promise<{
    success: boolean;
    data: {
      messages: Array<{
        id: number;
        conversationId: number;
        senderId: number;
        senderType: 'user' | 'member';
        message: string;
        read: boolean;
        createdAt: string;
      }>;
      pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    };
  }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const queryString = params.toString();
    return this.makeRequest(`/api/chat/user/conversation/${conversationId}/messages${queryString ? '?' + queryString : ''}`);
  }

  // Send a message
  async sendChatMessage(userId: number, conversationId: number, message: string): Promise<{
    success: boolean;
    data: {
      id: number;
      conversationId: number;
      senderId: number;
      senderType: 'user' | 'member';
      message: string;
      read: boolean;
      createdAt: string;
    };
  }> {
    return this.makeRequest(`/api/chat/user/conversation/${userId}/send`, {
      method: 'POST',
      body: JSON.stringify({
        conversationId,
        message,
        senderType: 'user'
      }),
    });
  }

  // Mark messages as read
  async markChatMessagesAsRead(conversationId: number, senderType: 'user' | 'member'): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.makeRequest(`/api/chat/user/conversation/${conversationId}/read`, {
      method: 'PUT',
      body: JSON.stringify({ senderType }),
    });
  }

  // Get unread message count for a user
  async getUnreadChatCount(userId: number): Promise<{
    success: boolean;
    data: {
      unreadCount: number;
    };
  }> {
    return this.makeRequest(`/api/chat/user/${userId}/unread-count`);
  }
}

// Create a singleton instance
export const apiService = new ApiService();

// Export the class for testing
export default ApiService;

