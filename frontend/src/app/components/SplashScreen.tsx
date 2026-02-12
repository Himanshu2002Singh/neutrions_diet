import { useState, useEffect, useRef } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showText, setShowText] = useState(false);
  const [textOpacity, setTextOpacity] = useState(1);
  const [logoVisible, setLogoVisible] = useState(false);
  const [welcomeText, setWelcomeText] = useState('');
  const [showWelcomeComplete, setShowWelcomeComplete] = useState(false);
  
  const welcomeRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Show logo with left-to-right animation
    const logoTimer = setTimeout(() => {
      setLogoVisible(true);
    }, 300);

    // Start typewriter animation for "Welcome to" after logo appears
    const textTimer = setTimeout(() => {
      setShowText(true);
      typewriterEffect();
    }, 1800);

    // Show Neutrion Diet text after typewriter completes
    const neutrionTimer = setTimeout(() => {
      setShowWelcomeComplete(true);
    }, 6500);

    // Start fading out text after 1 minute
    const textFadeTimer = setTimeout(() => {
      setTextOpacity(0);
    }, 60000);

    // Close splash screen after 3 seconds
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(neutrionTimer);
      clearTimeout(textFadeTimer);
      clearTimeout(closeTimer);
    };
  }, [onComplete]);

  // Typewriter effect for "Welcome to"
  const typewriterEffect = () => {
    const text = "Welcome to";
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setWelcomeText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#F8D94E] to-[#FFE566]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white rounded-full opacity-15 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full opacity-10 animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-10 w-16 h-16 bg-white rounded-full opacity-20 animate-pulse delay-300"></div>
        <div className="absolute top-20 right-1/4 w-20 h-20 bg-white rounded-full opacity-15 animate-pulse delay-400"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Welcome to - Typewriter Animation */}
        <div
          className="text-center mb-4"
          style={{
            opacity: showText ? 1 : 0,
            transform: showText ? 'translateX(0)' : 'translateX(-100px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
          }}
        >
          <h1
            ref={welcomeRef}
            className="text-4xl md:text-6xl font-bold text-gray-900 tracking-wide"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              minWidth: showWelcomeComplete ? 'auto' : '300px'
            }}
          >
            {welcomeText}
            <span className="animate-pulse">|</span>
          </h1>
        </div>

        {/* Bigger Logo with left-to-right slide animation */}
        <div
          className="mb-6"
          style={{
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? 'translateX(0)' : 'translateX(-150px)',
            transition: 'opacity 1s ease-out, transform 1.2s ease-out'
          }}
        >
          <img
            src="/images/logo.png"
            alt="NUTREAZY Logo"
            className="w-48 h-48 md:w-56 md:h-56 object-contain drop-shadow-lg"
            style={{
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))'
            }}
          />
        </div>

        {/* Neutrion Diet Text - Slides in after welcome */}
        <div
          className="text-center px-4"
          style={{
            opacity: showWelcomeComplete ? 1 : 0,
            transform: showWelcomeComplete ? 'translateX(0)' : 'translateX(-50px)',
            transition: 'opacity 1s ease-out, transform 1s ease-out',
            transitionDelay: '0.3s'
          }}
        >
          <h2
            className="text-5xl md:text-7xl font-bold text-[#FF6B4A] tracking-wider"
            style={{
              textShadow: '3px 3px 6px rgba(0,0,0,0.15)',
              letterSpacing: '0.1em'
            }}
          >
            Neutrion Diet
          </h2>
          <p
            className="text-xl md:text-2xl text-gray-700 font-medium mt-6 max-w-lg mx-auto leading-relaxed"
            style={{
              opacity: textOpacity,
              transition: 'opacity 2s ease-in-out'
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
          <div className="w-3 h-3 bg-[#FF6B4A] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-[#FF6B4A] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-[#FF6B4A] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Animated green leaves decoration */}
      <div className="absolute bottom-0 left-0 w-full h-24 overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          className="absolute bottom-0 w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,80 Q360,40 720,80 T1440,80 L1440,120 L0,120 Z"
            fill="rgba(255,255,255,0.4)"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Decorative circles */}
      <div className="absolute top-1/3 right-8 w-3 h-3 bg-white rounded-full opacity-40 animate-ping"></div>
      <div className="absolute bottom-1/4 left-12 w-2 h-2 bg-white rounded-full opacity-50 animate-ping delay-300"></div>
      <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full opacity-30 animate-ping delay-500"></div>

      {/* Styles */}
      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}

