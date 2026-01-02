import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { googleAuthService } from '../../services/googleAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; avatar: string }) => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Google Auth when modal opens
    if (isOpen && !isInitialized) {
      googleAuthService.initialize()
        .then(() => {
          setIsInitialized(true);
          // Render the Google Sign-In button
          renderGoogleButton();
        })
        .catch((err) => {
          console.error('Failed to initialize Google Auth:', err);
          setError('Failed to initialize Google login. Please try again.');
        });
    }
  }, [isOpen, isInitialized]);

  // Handle login result from googleAuthService
  useEffect(() => {
    if (!isOpen) return;

    // Set up a listener for login success
    const checkForUser = setInterval(() => {
      const user = googleAuthService.getCurrentUser();
      if (user) {
        clearInterval(checkForUser);
        onLoginSuccess(user);
      }
    }, 500);

    return () => clearInterval(checkForUser);
  }, [isOpen, onLoginSuccess]);

  // Render Google Sign-In button
  const renderGoogleButton = () => {
    if (buttonContainerRef.current) {
      googleAuthService.showSignInButton(buttonContainerRef.current);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#FFF8E8] border-2 border-[#F8D94E]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-[#FF6B4A]">
            Welcome to Nutreazy
          </DialogTitle>
          <DialogDescription className="sr-only">
            Sign in to get personalized diet recommendations and track your health journey
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Sign in to get personalized diet recommendations and track your health journey
            </p>
          </div>

          {/* Google Sign-In Button */}
          <div 
            ref={buttonContainerRef}
            className="w-full flex items-center justify-center"
            style={{ minHeight: '48px' }}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Continue as Guest
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
