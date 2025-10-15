"use client";

import { useEffect, useState } from 'react';

export default function ClientAnimations() {
  const [floatingElements, setFloatingElements] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const icons = ['❤️', '💙', '🩷', '💝', '💖'];
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      
      const newElement = {
        id: Date.now() + Math.random(),
        icon: randomIcon,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 4 + Math.random() * 3,
        size: 20 + Math.random() * 15
      };
      
      setFloatingElements(prev => [...prev.slice(-20), newElement]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Floating Hearts and Icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {floatingElements.map(element => (
          <div
            key={element.id}
            className="absolute animate-float-up"
            style={{
              left: `${element.left}%`,
              bottom: '-60px',
              animationDelay: `${element.delay}s`,
              animationDuration: `${element.duration}s`,
              fontSize: `${element.size}px`,
              opacity: 0.4
            }}
          >
            {element.icon}
          </div>
        ))}
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0.4;
          }
          50% {
            opacity: 0.6;
            transform: translateY(-50vh) rotate(180deg) scale(1.1);
          }
          100% {
            transform: translateY(-110vh) rotate(360deg) scale(0.8);
            opacity: 0;
          }
        }
        
        .animate-float-up {
          animation: float-up linear forwards;
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>
    </>
  );
}