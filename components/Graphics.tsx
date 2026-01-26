import React from 'react';

export const PegasusLogo = ({ className }: { className?: string }) => (
  <div className={`rounded-full bg-white flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 100" className="w-[70%] h-[70%] fill-blue-900" xmlns="http://www.w3.org/2000/svg">
       {/* Stylized Pegasus silhouette approximation */}
       <path d="M25,65 Q35,75 50,70 T70,50 Q80,40 75,30 Q70,20 60,25 Q65,15 55,10 Q45,5 40,20 Q30,15 25,25 Q35,30 35,40 Q20,45 25,65 Z M50,35 L60,15 L70,30 Z" style={{display: 'none'}} /> 
       {/* Using a cleaner abstract winged horse shape */}
       <path d="M78.5,33.5 c-3.2-4.5-9.6-6.4-9.6-6.4 s2.4-8.8-1.6-13.6 c-2.9-3.5-7.7-2.9-7.7-2.9 s-1.9,6.4-6.4,8 c-2.3,0.8-6.1,0.5-9.6-1.6 c-2.4-1.4-6.4,2.4-4,6.4 c1.6,2.7,4.8,3.2,4.8,3.2 s-6.4,8-8,14.4 c-0.8,3.2,0.8,6.4,3.2,8 c2.4,1.6,4.8-1.6,4.8-1.6 s-1.6,6.4,1.6,9.6 c3.2,3.2,8,1.6,8,1.6 s-1.6,4.8,1.6,8 c3.2,3.2,8,0,8,0 s0,0,1.6-3.2 c1.6-3.2-1.6-6.4-1.6-6.4 s6.4,3.2,9.6,0 c3.2-3.2,1.6-8,1.6-8 s4.8-1.6,6.4-4.8 C83.3,40.7,78.5,33.5,78.5,33.5 z M49.7,35.1 c0,0,8-9.6,19.2-8 c0,0-8,3.2-11.2,11.2 L49.7,35.1 z" />
    </svg>
  </div>
);

export const WavePattern = () => (
  <svg className="absolute bottom-0 left-0 w-full md:w-1/2 h-32 opacity-20 text-blue-400 fill-current pointer-events-none" viewBox="0 0 1200 120" preserveAspectRatio="none">
    <path d="M0,60 C150,90 300,30 450,60 C600,90 750,30 900,60 C1050,90 1200,60 1350,90 L1350,150 L0,150 Z" transform="translate(0, 20)" />
    <path d="M0,60 C150,90 300,30 450,60 C600,90 750,30 900,60 C1050,90 1200,60 1350,90 L1350,150 L0,150 Z" transform="translate(0, 40)" />
    <path d="M0,60 C150,90 300,30 450,60 C600,90 750,30 900,60 C1050,90 1200,60 1350,90 L1350,150 L0,150 Z" transform="translate(0, 60)" />
  </svg>
);

export const FloralPattern = () => (
  <svg className="absolute top-0 right-0 w-full md:w-1/2 h-full opacity-10 pointer-events-none" viewBox="0 0 500 500">
    <defs>
      <pattern id="floral" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M50 0 C20 0 0 20 0 50 C0 80 20 100 50 100 C80 100 100 80 100 50 C100 20 80 0 50 0 Z M50 20 C60 20 70 30 70 50 C70 70 60 80 50 80 C40 80 30 70 30 50 C30 30 40 20 50 20 Z" fill="white" />
        <path d="M0 0 L20 20 M100 0 L80 20 M0 100 L20 80 M100 100 L80 80" stroke="white" strokeWidth="2" />
      </pattern>
    </defs>
    <rect width="500" height="500" fill="url(#floral)" />
    <radialGradient id="fade" cx="0.8" cy="0.2" r="0.8">
      <stop offset="0%" stopColor="white" stopOpacity="1" />
      <stop offset="100%" stopColor="white" stopOpacity="0" />
    </radialGradient>
  </svg>
);

export const SeparatorLine = () => (
    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent my-6 opacity-80 rounded-full" />
)
