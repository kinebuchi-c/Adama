'use client';

import { Expression, AvatarAppearance, HairColor, HairStyle, SkinTone } from '@/types';

interface CharacterAvatarProps {
  appearance?: Partial<AvatarAppearance>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  expression?: Expression;
  className?: string;
}

const sizeMap = {
  sm: 56,
  md: 96,
  lg: 140,
  xl: 180,
};

const hairColors: Record<HairColor, string> = {
  black: '#2D2D2D',
  brown: '#5D4037',
  blonde: '#E8C872',
  red: '#B85C38',
  blue: '#5B8FB9',
  pink: '#E893B8',
  green: '#6B9080',
  purple: '#9B7BB8',
  orange: '#E8945C',
};

const skinColors: Record<SkinTone, string> = {
  light: '#FFECD2',
  medium: '#F5D0B0',
  tan: '#D4A574',
  dark: '#A67C52',
};

// 表情に応じた口の形
const mouthPaths: Record<Expression, string> = {
  happy: 'M 42 65 Q 50 72 58 65',
  neutral: 'M 44 66 L 56 66',
  excited: 'M 40 63 Q 50 74 60 63',
  proud: 'M 43 64 Q 50 70 57 64',
  thinking: 'M 45 66 Q 50 64 55 66',
};

export default function CharacterAvatar({
  appearance,
  size = 'md',
  expression = 'happy',
  className = '',
}: CharacterAvatarProps) {
  const pixelSize = sizeMap[size];
  const hairColor = hairColors[appearance?.hairColor || 'brown'];
  const skinColor = skinColors[appearance?.skinTone || 'light'];
  const hairStyle = appearance?.hairStyle || 'medium';

  // 髪型の後ろ部分
  const getHairBack = () => {
    switch (hairStyle) {
      case 'short':
        return <ellipse cx="50" cy="38" rx="36" ry="30" fill={hairColor} />;
      case 'long':
        return (
          <>
            <ellipse cx="50" cy="38" rx="40" ry="34" fill={hairColor} />
            <ellipse cx="22" cy="60" rx="14" ry="35" fill={hairColor} />
            <ellipse cx="78" cy="60" rx="14" ry="35" fill={hairColor} />
          </>
        );
      case 'twintail':
        return (
          <>
            <ellipse cx="50" cy="38" rx="38" ry="32" fill={hairColor} />
            <ellipse cx="15" cy="42" rx="12" ry="14" fill={hairColor} />
            <ellipse cx="85" cy="42" rx="12" ry="14" fill={hairColor} />
            <path d="M 15 56 Q 5 80 10 100" stroke={hairColor} strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M 85 56 Q 95 80 90 100" stroke={hairColor} strokeWidth="16" fill="none" strokeLinecap="round" />
          </>
        );
      case 'ponytail':
        return (
          <>
            <ellipse cx="50" cy="38" rx="38" ry="32" fill={hairColor} />
            <ellipse cx="82" cy="35" rx="12" ry="15" fill={hairColor} />
            <path d="M 82 50 Q 95 75 88 100" stroke={hairColor} strokeWidth="16" fill="none" strokeLinecap="round" />
          </>
        );
      default: // medium
        return (
          <>
            <ellipse cx="50" cy="38" rx="38" ry="32" fill={hairColor} />
            <ellipse cx="18" cy="55" rx="12" ry="25" fill={hairColor} />
            <ellipse cx="82" cy="55" rx="12" ry="25" fill={hairColor} />
          </>
        );
    }
  };

  // 前髪
  const getHairFront = () => {
    switch (hairStyle) {
      case 'short':
        return (
          <path d="M 18 48 C 18 20, 50 12, 50 12 C 50 12, 82 20, 82 48 L 75 45 C 72 35, 60 30, 50 30 C 40 30, 28 35, 25 45 Z" fill={hairColor} />
        );
      case 'curly':
        return (
          <>
            <circle cx="30" cy="28" r="14" fill={hairColor} />
            <circle cx="50" cy="22" r="16" fill={hairColor} />
            <circle cx="70" cy="28" r="14" fill={hairColor} />
          </>
        );
      case 'spiky':
        return (
          <>
            <path d="M 30 40 L 22 10 L 38 35" fill={hairColor} />
            <path d="M 42 35 L 38 5 L 52 30" fill={hairColor} />
            <path d="M 50 32 L 50 0 L 55 30" fill={hairColor} />
            <path d="M 58 35 L 62 5 L 48 30" fill={hairColor} />
            <path d="M 70 40 L 78 10 L 62 35" fill={hairColor} />
            <path d="M 20 50 C 20 32, 50 25, 50 25 C 50 25, 80 32, 80 50 L 72 46 C 70 38, 60 34, 50 34 C 40 34, 30 38, 28 46 Z" fill={hairColor} />
          </>
        );
      default:
        return (
          <path d="M 15 52 C 15 18, 50 10, 50 10 C 50 10, 85 18, 85 52 L 78 48 C 75 35, 62 28, 50 28 C 38 28, 25 35, 22 48 Z" fill={hairColor} />
        );
    }
  };

  // ツインテールのゴム
  const getTwintailTies = () => {
    if (hairStyle === 'twintail') {
      return (
        <>
          <circle cx="15" cy="44" r="6" fill="#FF8A8A" />
          <circle cx="85" cy="44" r="6" fill="#FF8A8A" />
        </>
      );
    }
    if (hairStyle === 'ponytail') {
      return <circle cx="82" cy="38" r="6" fill="#FF8A8A" />;
    }
    return null;
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        className="transition-all duration-300"
      >
        {/* 髪の毛（後ろ） */}
        {getHairBack()}

        {/* 顔 */}
        <ellipse cx="50" cy="55" rx="32" ry="35" fill={skinColor} />

        {/* 頬の赤み */}
        <ellipse cx="28" cy="62" rx="8" ry="5" fill="#FFAEB0" opacity="0.5" />
        <ellipse cx="72" cy="62" rx="8" ry="5" fill="#FFAEB0" opacity="0.5" />

        {/* 目 */}
        <circle cx="38" cy="55" r="5" fill="#2D2D2D" />
        <circle cx="62" cy="55" r="5" fill="#2D2D2D" />
        {/* 目のハイライト */}
        <circle cx="39.5" cy="53.5" r="2" fill="#FFFFFF" />
        <circle cx="63.5" cy="53.5" r="2" fill="#FFFFFF" />

        {/* 口 */}
        <path
          d={mouthPaths[expression]}
          fill="none"
          stroke="#D4726A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* 前髪 */}
        {getHairFront()}

        {/* ツインテールのゴム */}
        {getTwintailTies()}

        {/* excited の時のキラキラ */}
        {expression === 'excited' && (
          <>
            <circle cx="8" cy="30" r="3" fill="#FFE066" />
            <circle cx="92" cy="30" r="3" fill="#FFE066" />
            <circle cx="5" cy="40" r="2" fill="#FFE066" />
            <circle cx="95" cy="40" r="2" fill="#FFE066" />
          </>
        )}
      </svg>
    </div>
  );
}
