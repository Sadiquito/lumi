
import React from 'react';

interface JournalLayoutProps {
  children: React.ReactNode;
}

export const JournalLayout: React.FC<JournalLayoutProps> = ({ children }) => {
  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundColor: 'rgb(15, 23, 42)',
        backgroundImage: `url('/lovable-uploads/1e779805-c108-43d4-b827-10df1f9b34e9.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
};
