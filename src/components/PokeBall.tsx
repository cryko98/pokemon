import React from 'react';

interface PokeBallProps {
  className?: string;
  animate?: boolean;
  type?: 'classic' | 'great' | 'ultra' | 'master';
}

export default function PokeBall({ className = "w-6 h-6", animate = true, type = 'classic' }: PokeBallProps) {
  // Define colors based on the Pokéball types
  let topColor = '#EF4444'; // Red for classic
  let accentElements: React.ReactNode = null;

  if (type === 'great') {
    topColor = '#3B82F6'; // Blue
    accentElements = (
      <>
        {/* Pink/Red ridges on the sides of Great Ball */}
        <path d="M 22,18 C 24,10 32,15 30,22" fill="none" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
        <path d="M 78,18 C 76,10 68,15 70,22" fill="none" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
      </>
    );
  } else if (type === 'ultra') {
    topColor = '#1F2937'; // Black/dark grey
    accentElements = (
      <>
        {/* Yellow "U" pattern on Ultra Ball */}
        <path d="M 25,18 C 30,12 40,16 38,28" fill="none" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
        <path d="M 75,18 C 70,12 60,16 62,28" fill="none" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
        <path d="M 43,10 L 57,10" fill="none" stroke="#FBBF24" strokeWidth="5.5" strokeLinecap="round" />
      </>
    );
  } else if (type === 'master') {
    topColor = '#7C3AED'; // Purple
    accentElements = (
      <>
        {/* Pink bumps on Master Ball */}
        <circle cx="28" cy="24" r="5" fill="#EC4899" />
        <circle cx="72" cy="24" r="5" fill="#EC4899" />
        {/* White "M" in center */}
        <text x="50" y="32" fill="#FFFFFF" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">M</text>
      </>
    );
  }

  return (
    <div 
      className={`relative inline-block select-none ${className} ${
        animate 
          ? "hover:rotate-[360deg] hover:scale-110 active:scale-95 transition-all duration-700 ease-out cursor-pointer active:animate-ping" 
          : ""
      }`}
    >
      <svg 
        viewBox="0 0 100 100" 
        className={`w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${type === 'classic' ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.35)]' : ''}`}
      >
        {/* Bottom half backer: White shadow */}
        <circle cx="50" cy="50" r="45" fill="#E2E8F0" />
        
        {/* Bottom half: White */}
        <path d="M 5,50 A 45,45 0 0,0 95,50 Z" fill="#F8FAFC" />
        
        {/* Top half: Themed red/blue/dark/purple */}
        <path d="M 5,50 A 45,45 0 0,1 95,50 Z" fill={topColor} />
        
        {/* Accent visual patterns */}
        {accentElements}

        {/* Outer border of Pokéball */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="#0F172A" strokeWidth="6" />

        {/* Horizontal dividing belt */}
        <line x1="5" y1="50" x2="95" y2="50" stroke="#0F172A" strokeWidth="6" />
        
        {/* Center button - lock cylinder */}
        <circle cx="50" cy="50" r="15" fill="#0F172A" />
        <circle cx="50" cy="50" r="10" fill="#F8FAFC" />
        
        {/* Central clickable led button with ambient yellow/white pulsing core */}
        <circle 
          cx="50" 
          cy="50" 
          r="5" 
          className="animate-pulse" 
          fill="#38BDF8" 
          style={{ transformOrigin: 'center' }} 
        />
        <circle cx="48" cy="48" r="2.2" fill="#FFFFFF" opacity="0.8" />
      </svg>
    </div>
  );
}
