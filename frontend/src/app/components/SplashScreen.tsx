import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showText, setShowText] = useState(false);
  const [textOpacity, setTextOpacity] = useState(1);

  useEffect(() => {
    // Show text after logo appears
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 5000);

    // Start fading out text after 1 minute (before main splash closes)
    const textFadeTimer = setTimeout(() => {
      setTextOpacity(0);
    }, 60000);

    // Close splash screen after 3 seconds
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 3000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(textFadeTimer);
      clearTimeout(closeTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#F8D94E] to-[#FFE566]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white rounded-full opacity-15 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with bounce and scale animation */}
        <div
          className="mb-8 animate-[bounce_1s_ease-out]"
          style={{
            animationDelay: '0.2s',
            animationFillMode: 'both'
          }}
        >
          <img
            src="/images/logo.png"
            alt="NUTREAZY Logo"
            className="w-32 h-32 md:w-40 md:h-40 object-contain"
          />
        </div>

        {/* Welcome Text with slide-up and fade-in */}
        <div
          className="text-center px-4 transition-all duration-1000"
          style={{
            opacity: showText ? textOpacity : 0,
            transform: showText ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease-in-out, transform 1s ease-out'
          }}
        >
          <h1
            className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-wide"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Welcome to
          </h1>
          <h2
            className="text-4xl md:text-6xl font-bold text-[#FF6B4A] mb-6 tracking-wider"
            style={{
              textShadow: '3px 3px 6px rgba(0,0,0,0.15)'
            }}
          >
            Neutrion Diet
          </h2>
          <p
            className="text-lg md:text-xl text-gray-700 font-medium max-w-md mx-auto leading-relaxed"
            style={{
              opacity: textOpacity,
              transition: 'opacity 2s ease-in-out 1s'
            }}
          >
            Your Personalized Nutrition Journey Starts Here
          </p>
        </div>
      </div>

      {/* Loading indicator at bottom */}
      <div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        style={{ opacity: textOpacity }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#FF6B4A] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-[#FF6B4A] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-[#FF6B4A] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Fade out overlay */}
      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}

