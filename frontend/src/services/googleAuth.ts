// Google OAuth Authentication Service
// Uses Google Identity Services (GIS) SDK with FedCM support for account detection

const GOOGLE_CLIENT_ID = '569194456128-o6j4g39gnlkooobeigim22jum5f13gp6.apps.googleusercontent.com';
const API_URL = 'https://api.nutreazy.in';
// const API_URL =  'http://localhost:3002'

interface GoogleUser {
  id?: number;
  name: string;
  email: string;
  avatar: string;
}

interface BackendUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  isGoogleUser: boolean;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: BackendUser;
    token: string;
  };
  error?: string;
}

// Type declarations for Google Identity Services
// 'google' is declared in global types (vite-env.d.ts), avoid redeclaring to prevent conflicting types.

class GoogleAuthService {
  private clientId: string;
  private pendingResolve: ((user: GoogleUser | null) => void) | null = null;
  private pendingReject: ((error: Error) => void) | null = null;
  private isPromptShown: boolean = false;

  constructor() {
    this.clientId = GOOGLE_CLIENT_ID;
  }

  // Initialize Google Identity Services
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof (window as any).google === 'undefined') {
        // Load the Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.initGoogleSignIn(resolve, reject);
        };
        script.onerror = () => {
          reject(new Error('Failed to load Google Identity Services'));
        };
        document.head.appendChild(script);
      } else {
        this.initGoogleSignIn(resolve, reject);
      }
    });
  }

  private initGoogleSignIn(resolve: () => void, reject: (error: Error) => void): void {
    try {
      ((window as any).google.accounts as any).id.initialize({
        client_id: this.clientId,
        callback: (response: any) => {
          this.handleCredentialResponse(response);
        },
        auto_select: false, // Disabled due to FedCM CORS issues on localhost
        cancel_on_tap_outside: true,
        itp_support: true,
        use_fedcm_for_prompt: false, // Disable FedCM - use traditional flow
      });
      resolve();
    } catch (error) {
      reject(new Error('Failed to initialize Google Sign-In'));
    }
  }

  // Handle the credential response from Google
  private async handleCredentialResponse(response: any): Promise<void> {
    if (response.credential) {
      try {
        // Send the credential to our backend for validation and user creation
        const backendResponse = await fetch(`${API_URL}/api/auth/google/credential`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ credential: response.credential }),
        });

        const data = await backendResponse.json();

        if (data.success && data.data) {
          const user: GoogleUser = {
            id: data.data.user.id,
            name: data.data.user.name,
            email: data.data.user.email,
            avatar: data.data.user.avatar,
          };

          // Store user data
          localStorage.setItem('neutrion-user', JSON.stringify(user));
          localStorage.setItem('neutrion-auth-token', data.data.token);
          localStorage.setItem('google_access_token', response.credential);
          
          // IMPORTANT: Store userId for health form submissions (also keep for backwards compatibility)
          localStorage.setItem('userId', String(data.data.user.id));
          console.log('✅ User logged in with ID:', data.data.user.id);

          // Resolve the pending promise
          if (this.pendingResolve) {
            this.pendingResolve(user);
            this.pendingResolve = null;
            this.pendingReject = null;
          }
        } else {
          throw new Error(data.error || 'Authentication failed');
        }
      } catch (error: any) {
        console.error('Backend auth error:', error);
        if (this.pendingReject) {
          this.pendingReject(new Error(error.message || 'Authentication failed'));
          this.pendingResolve = null;
          this.pendingReject = null;
        }
      }
    } else {
      if (this.pendingReject) {
        this.pendingReject(new Error('No credential received from Google'));
        this.pendingResolve = null;
        this.pendingReject = null;
      }
    }
    this.isPromptShown = false;
  }

  // Decode JWT token
  private decodeJwtResponse(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  // Get list of saved accounts for custom account picker
  async getSavedAccounts(): Promise<any[]> {
    return new Promise((resolve) => {
      if (typeof (window as any).google === 'undefined') {
        resolve([]);
        return;
      }

      try {
        ((window as any).google.accounts as any).id.prompt((notification: any) => {
          // Get account info from the notification if available
          if (notification.isDisplayed() && notification.getAccountHint) {
            // Account hint is available
          }
          resolve([]);
        });
        
        // Also try direct account listing
        ((window as any).google.accounts as any).id.ready?.then(() => {
          // Accounts might be cached
        });
      } catch (error) {
        resolve([]);
      }
    });
  }

  // Trigger Google Sign-In - for button-based flow, the button handles the flow
  // This is mainly for tracking/logging purposes
  async signIn(): Promise<GoogleUser | null> {
    // The Google Sign-In button handles the authentication flow
    // This method is kept for compatibility but the actual flow is handled by the button
    console.log('Google Sign-In button should be clicked to authenticate');
    return null;
  }

  // Redirect to Google Sign-In (fallback method)
  private redirectToGoogleSignIn(): void {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: `${API_URL}/api/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      hd: '*',
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Render the One Tap prompt (optional, call this on page load)
  async showOneTapPrompt(): Promise<void> {
    if (typeof (window as any).google === 'undefined' || this.isPromptShown) {
      return;
    }

    try {
      this.isPromptShown = true;
      await ((window as any).google.accounts as any).id.prompt();
    } catch (error) {
      console.log('One Tap prompt could not be shown:', error);
      this.isPromptShown = false;
    }
  }

  // Cancel the One Tap prompt
  cancelOneTapPrompt(): void {
    if (typeof (window as any).google !== 'undefined') {
      ((window as any).google.accounts as any).id.cancel();
      this.isPromptShown = false;
    }
  }

  // Show the rendered Google Sign-In button in a container
  showSignInButton(container: HTMLElement): void {
    if (typeof (window as any).google !== 'undefined') {
      ((window as any).google.accounts as any).id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        height: 48,
      });
    }
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('neutrion-user') && !!localStorage.getItem('neutrion-auth-token');
  }

  // Get current user from localStorage
  getCurrentUser(): GoogleUser | null {
    const userData = localStorage.getItem('neutrion-user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Get auth token for API requests
  getAuthToken(): string | null {
    return localStorage.getItem('neutrion-auth-token');
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('neutrion-user');
    localStorage.removeItem('neutrion-auth-token');
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('userId'); // Clear userId on logout
    sessionStorage.removeItem('google_access_token');

    // Sign out from Google
    if (typeof (window as any).google !== 'undefined') {
      ((window as any).google.accounts as any).id.disableAutoSelect();
    }
  }

  // Get user from backend (with token validation)
  async getCurrentUserFromBackend(): Promise<BackendUser | null> {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user from backend:', error);
      return null;
    }
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();

// Export class for testing
export default GoogleAuthService;

