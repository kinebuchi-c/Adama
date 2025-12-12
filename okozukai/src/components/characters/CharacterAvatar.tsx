'use client';

import { Expression } from '@/types';

interface CharacterAvatarProps {
  character?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  expression?: Expression;
  className?: string;
}

const sizeMap = {
  sm: 48,
  md: 80,
  lg: 120,
  xl: 160,
};

// 表情に応じた目と口の形
const expressionStyles: Record<Expression, { eyeY: number; mouthPath: string; eyeHeight: number }> = {
  happy: {
    eyeY: 38,
    eyeHeight: 4,
    mouthPath: 'M 35 52 Q 50 60 65 52', // 笑顔
  },
  neutral: {
    eyeY: 40,
    eyeHeight: 6,
    mouthPath: 'M 38 54 L 62 54', // 普通
  },
  excited: {
    eyeY: 38,
    eyeHeight: 5,
    mouthPath: 'M 35 50 Q 50 62 65 50', // 大きな笑顔
  },
  proud: {
    eyeY: 40,
    eyeHeight: 5,
    mouthPath: 'M 38 52 Q 50 56 62 52', // 自信のある微笑み
  },
  thinking: {
    eyeY: 40,
    eyeHeight: 6,
    mouthPath: 'M 42 54 Q 50 52 58 54', // 考え中
  },
};

export default function CharacterAvatar({
  size = 'md',
  expression = 'neutral',
  className = '',
}: CharacterAvatarProps) {
  const pixelSize = sizeMap[size];
  const styles = expressionStyles[expression];

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        className="transition-all duration-300"
      >
        {/* 背景の丸 */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="#FFF5E6"
          stroke="#FFD699"
          strokeWidth="2"
        />

        {/* 髪の毛 */}
        <ellipse
          cx="50"
          cy="28"
          rx="30"
          ry="18"
          fill="#5D4037"
        />
        <ellipse
          cx="30"
          cy="35"
          rx="8"
          ry="12"
          fill="#5D4037"
        />
        <ellipse
          cx="70"
          cy="35"
          rx="8"
          ry="12"
          fill="#5D4037"
        />

        {/* 顔 */}
        <ellipse
          cx="50"
          cy="52"
          rx="28"
          ry="30"
          fill="#FFE4C4"
        />

        {/* 左目 */}
        <ellipse
          cx="40"
          cy={styles.eyeY}
          rx="4"
          ry={styles.eyeHeight}
          fill="#4A4A4A"
        />

        {/* 右目 */}
        <ellipse
          cx="60"
          cy={styles.eyeY}
          rx="4"
          ry={styles.eyeHeight}
          fill="#4A4A4A"
        />

        {/* 眉毛 */}
        <path
          d="M 34 32 Q 40 30 46 32"
          fill="none"
          stroke="#5D4037"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 54 32 Q 60 30 66 32"
          fill="none"
          stroke="#5D4037"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* 頬の赤み */}
        <circle cx="30" cy="50" r="5" fill="#FFB6C1" opacity="0.5" />
        <circle cx="70" cy="50" r="5" fill="#FFB6C1" opacity="0.5" />

        {/* 口 */}
        <path
          d={styles.mouthPath}
          fill="none"
          stroke="#D4726A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* excited の時のキラキラ */}
        {expression === 'excited' && (
          <>
            <polygon
              points="15,20 17,25 22,25 18,28 20,33 15,30 10,33 12,28 8,25 13,25"
              fill="#FFD700"
              className="animate-pulse"
            />
            <polygon
              points="85,20 87,25 92,25 88,28 90,33 85,30 80,33 82,28 78,25 83,25"
              fill="#FFD700"
              className="animate-pulse"
            />
          </>
        )}
      </svg>
    </div>
  );
}
