'use client';

import { Expression } from '@/types';

interface CharacterAvatarProps {
  character?: string; // 互換性のため残す
  size?: 'sm' | 'md' | 'lg' | 'xl';
  expression?: Expression;
  className?: string;
}

const sizeClasses = {
  sm: 'text-4xl',
  md: 'text-6xl',
  lg: 'text-8xl',
  xl: 'text-9xl',
};

const expressionEffects: Record<Expression, string> = {
  happy: 'animate-bounce',
  neutral: '',
  excited: 'animate-pulse',
  proud: 'animate-bounce',
  thinking: '',
};

// 表情による絵文字
const expressionEmojis: Record<Expression, string> = {
  happy: '😊',
  neutral: '🙂',
  excited: '🤩',
  proud: '😎',
  thinking: '🤔',
};

export default function CharacterAvatar({
  size = 'md',
  expression = 'neutral',
  className = '',
}: CharacterAvatarProps) {
  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} ${expressionEffects[expression]} transition-all duration-300`}
      >
        {expressionEmojis[expression]}
      </div>
      {expression === 'excited' && (
        <div className="absolute -top-2 -right-2 text-2xl animate-ping">✨</div>
      )}
    </div>
  );
}
