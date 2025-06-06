
import React from 'react';

const ProcessingState: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lumi-sunset-gold/80 to-lumi-sunset-gold/60 flex items-center justify-center shadow-2xl">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
        <h3 className="text-white text-lg font-medium mb-2" style={{ fontFamily: 'Cinzel' }}>
          Lumi is thinking
        </h3>
        <p className="text-white/70" style={{ fontFamily: 'Crimson Pro' }}>
          Processing your response and preparing a thoughtful follow-up
        </p>
      </div>
    </div>
  );
};

export default ProcessingState;
