/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  namespace google.accounts.oauth2 {
    interface TokenClient {
      requestAccessToken(overrideConfig?: { prompt?: string }): void;
      callback: (response: TokenResponse) => void;
      error_callback: (error: OAuth2Error) => void;
    }

    interface TokenResponse {
      access_token: string;
      expires_in: number;
      scope: string;
      token_type: string;
      error?: string;
      error_description?: string;
    }

    interface OAuth2Error {
      message: string;
      error: string;
      error_description?: string;
    }

    interface IdConfiguration {
      client_id: string;
      callback: (response: CredentialResponse) => void;
      auto_select?: boolean;
      cancel_on_tap_outside?: boolean;
      itp_support?: boolean;
    }

    interface CredentialResponse {
      credential?: string;
      select_by?: string;
      error?: string;
    }

    interface GoogleId {
      initialize: (config: IdConfiguration) => void;
      renderButton: (element: HTMLElement, options: ButtonConfig) => void;
      requestIdToken: (config: IdTokenRequestConfig) => void;
      prompt: (notification?: (notification: PromptNotification) => void) => void;
      revoke: (accessToken: string, done?: () => void) => void;
      disableAutoSelect: () => void;
    }

    interface ButtonConfig {
      type?: 'standard' | 'icon';
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'small' | 'medium' | 'large';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      logo_alignment?: 'left' | 'center';
      width?: number;
    }

    interface IdTokenRequestConfig {
      client_id: string;
      callback: (response: CredentialResponse) => void;
      nonce?: string;
    }

    interface PromptNotification {
      isNotDisplayed(): boolean;
      getNotDisplayedReason(): string;
      isSkippedMoment(): boolean;
      getSkippedReason(): string;
      isDismissedMoment(): boolean;
      getDismissedReason(): string;
    }

    function initTokenClient(config: {
      client_id: string;
      scope: string;
      callback: (response: TokenResponse) => void;
      error_callback?: (error: OAuth2Error) => void;
    }): TokenClient;
  }

  interface Window {
    google: typeof google;
  }
}

export {};

