
import React, { useEffect, useRef, useState } from 'react';

interface AudioWaveformProps {
  audioData?: Float32Array;
  isRecording: boolean;
  isSpeaking: boolean;
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioData,
  isRecording,
  isSpeaking,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [visualData, setVisualData] = useState<number[]>(new Array(50).fill(0));

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = width / visualData.length;
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      
      if (isSpeaking) {
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#059669');
      } else if (isRecording) {
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#1d4ed8');
      } else {
        gradient.addColorStop(0, '#6b7280');
        gradient.addColorStop(1, '#4b5563');
      }
      
      ctx.fillStyle = gradient;
      
      visualData.forEach((value, index) => {
        const barHeight = (value * height) / 2;
        const x = index * barWidth;
        const y = (height - barHeight) / 2;
        
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      });
    };

    const animate = () => {
      if (audioData && (isRecording || isSpeaking)) {
        // Convert audio data to visual representation
        const newData = Array.from({ length: 50 }, (_, i) => {
          const start = Math.floor((i / 50) * audioData.length);
          const end = Math.floor(((i + 1) / 50) * audioData.length);
          const slice = audioData.slice(start, end);
          const avg = slice.reduce((sum, val) => sum + Math.abs(val), 0) / slice.length;
          return Math.min(avg * 10, 1); // Normalize and amplify
        });
        setVisualData(newData);
      } else if (!isRecording && !isSpeaking) {
        // Fade out animation
        setVisualData(prev => prev.map(val => val * 0.95));
      }
      
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioData, isRecording, isSpeaking, visualData]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={60}
      className={`rounded-lg ${className}`}
      style={{ background: 'rgba(0,0,0,0.1)' }}
    />
  );
};
