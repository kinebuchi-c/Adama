'use client';

import { useState, useEffect } from 'react';
import CharacterAvatar from '@/components/characters/CharacterAvatar';
import { Reward } from '@/types';

interface StarJarProps {
  totalStars: number;
  isAnimating?: boolean;
  newStars?: number;
  nextReward?: Reward;
  yenPerStar?: number; // 1ほし何円か（デフォルト10円）
  showYen?: boolean; // 金額を表示するか
  onAnimationEnd?: () => void;
}

export default function StarJar({
  totalStars,
  isAnimating = false,
  newStars = 0,
  nextReward,
  yenPerStar = 10,
  showYen = true,
  onAnimationEnd,
}: StarJarProps) {
  const [showStars, setShowStars] = useState(false);
  const [displayStars, setDisplayStars] = useState(totalStars);

  useEffect(() => {
    if (isAnimating && newStars > 0) {
      setShowStars(true);
      const timer = setTimeout(() => {
        setShowStars(false);
        setDisplayStars(totalStars);
        onAnimationEnd?.();
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setDisplayStars(totalStars);
    }
  }, [totalStars, isAnimating, newStars, onAnimationEnd]);

  // ほしの表示（最大表示数を制限）
  const starDisplay = Math.min(displayStars, 99);
  const progressToReward = nextReward
    ? Math.min((displayStars / nextReward.starsRequired) * 100, 100)
    : 0;

  return (
    <div className="relative flex flex-col items-center p-8 bg-gradient-to-b from-indigo-900 to-purple-900 rounded-3xl shadow-lg overflow-hidden">
      {/* 背景の星 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-200 opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 10 + 8}px`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            ✦
          </div>
        ))}
      </div>

      {/* 降ってくるほしアニメーション */}
      {showStars && (
        <div className="absolute top-0 left-0 right-0 flex justify-center gap-4 z-10">
          {[...Array(Math.min(newStars, 5))].map((_, i) => (
            <div
              key={i}
              className="text-4xl animate-bounce"
              style={{
                animationDelay: `${i * 150}ms`,
                animationDuration: '0.8s',
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}

      {/* キャラクター */}
      <div className="relative z-10">
        <CharacterAvatar
          size="xl"
          expression={isAnimating ? 'excited' : 'happy'}
        />
      </div>

      {/* ほしの数 */}
      <div className="mt-4 text-center relative z-10">
        <p className="text-indigo-200 text-sm mb-1">集めた星</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-5xl">⭐</span>
          <span className="text-5xl font-bold text-yellow-300">
            {starDisplay}
          </span>
        </div>
        {displayStars > 99 && (
          <p className="text-yellow-200 text-sm mt-1">
            +{displayStars - 99} もっと！
          </p>
        )}

        {/* 合計金額 */}
        {showYen && (
          <div className="mt-3 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full inline-block">
            <span className="text-yellow-900 font-bold text-lg">
              💰 おこづかい {displayStars * yenPerStar}円
            </span>
          </div>
        )}
      </div>

      {/* 次のごほうびまでの進捗 */}
      {nextReward && (
        <div className="w-full mt-6 relative z-10">
          <div className="flex justify-between text-sm text-indigo-200 mb-2">
            <span>次のごほうびまで</span>
            <span>
              {displayStars} / {nextReward.starsRequired} ⭐
            </span>
          </div>
          <div className="h-4 bg-indigo-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${progressToReward}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-2 mt-3 text-white">
            <span className="text-2xl">{nextReward.icon}</span>
            <span className="font-medium">{nextReward.name}</span>
          </div>
          {progressToReward >= 100 && (
            <div className="mt-2 text-center">
              <span className="inline-block px-4 py-2 bg-yellow-400 text-yellow-900 font-bold rounded-full animate-pulse">
                🎉 ごほうびゲット！
              </span>
            </div>
          )}
        </div>
      )}

      {/* 励ましメッセージ */}
      <div className="mt-4 text-center relative z-10">
        <p className="text-indigo-200 text-sm">
          {displayStars === 0
            ? 'お手伝いをして星を集めよう！'
            : displayStars < 5
            ? 'いい調子！その調子でがんばろう'
            : displayStars < 10
            ? 'すごい！どんどん増えてるね'
            : '星集めマスター！✨'}
        </p>
      </div>
    </div>
  );
}
