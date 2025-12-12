'use client';

import { useState, useEffect } from 'react';
import CharacterAvatar from '@/components/characters/CharacterAvatar';

interface PiggyBankProps {
  amount: number;
  isAnimating?: boolean;
  onAnimationEnd?: () => void;
}

export default function PiggyBank({
  amount,
  isAnimating = false,
  onAnimationEnd,
}: PiggyBankProps) {
  const [showCoins, setShowCoins] = useState(false);
  const [displayAmount, setDisplayAmount] = useState(amount);

  useEffect(() => {
    if (isAnimating) {
      setShowCoins(true);
      const timer = setTimeout(() => {
        setShowCoins(false);
        setDisplayAmount(amount);
        onAnimationEnd?.();
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setDisplayAmount(amount);
    }
  }, [amount, isAnimating, onAnimationEnd]);

  return (
    <div className="relative flex flex-col items-center p-8 bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl shadow-lg">
      {/* Falling coins animation */}
      {showCoins && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="text-3xl animate-bounce"
              style={{
                animationDelay: `${i * 100}ms`,
                animationDuration: '0.5s',
              }}
            >
              🪙
            </div>
          ))}
        </div>
      )}

      {/* Character with piggy bank */}
      <CharacterAvatar
        size="xl"
        expression={isAnimating ? 'excited' : 'happy'}
      />

      {/* Savings display */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-1">たまったおかね</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-amber-600">
            {displayAmount.toLocaleString()}
          </span>
          <span className="text-2xl text-amber-600">円</span>
        </div>
      </div>

      {/* Progress bar style indicator */}
      <div className="w-full mt-4">
        <div className="h-4 bg-amber-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-out"
            style={{ width: `${Math.min((amount / 1000) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 text-center mt-1">
          {amount >= 1000
            ? '🎉 1000円たまった！'
            : `あと ${1000 - amount}円で1000円！`}
        </p>
      </div>
    </div>
  );
}
