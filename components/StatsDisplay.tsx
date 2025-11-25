
import React from 'react';
import { GameStatus } from '../types';

interface StatsDisplayProps {
  status: GameStatus;
  wpm: number;
  accuracy: number;
  time: number;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ status, wpm, accuracy, time }) => {
  if (status === GameStatus.WAITING) {
    return <div className="text-lg font-medium">Start typing to begin...</div>;
  }
  
  return (
    <div className="flex space-x-6 text-xl font-medium">
      <div className="text-center">
        <span className="font-bold text-[var(--correct-color)]">{time}</span>
        <span className="text-sm ml-1">s</span>
      </div>
      <div className="text-center">
        <span className="font-bold text-[var(--correct-color)]">{wpm}</span>
        <span className="text-sm ml-1">wpm</span>
      </div>
      <div className="text-center">
        <span className="font-bold text-[var(--correct-color)]">{accuracy}</span>
        <span className="text-sm ml-1">%</span>
      </div>
    </div>
  );
};
