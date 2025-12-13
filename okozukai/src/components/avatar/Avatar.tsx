'use client';

import {
  AvatarAppearance,
  Expression,
  HairStyle,
  HairColor,
  SkinTone,
} from '@/types';

interface AvatarProps {
  appearance: AvatarAppearance;
  expression?: Expression;
  equipped?: {
    top?: string;
    bottom?: string;
    hat?: string;
    accessory?: string;
    effect?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// 肌色
const skinColors: Record<SkinTone, { base: string; shadow: string }> = {
  light: { base: '#FFECD2', shadow: '#F5DCC2' },
  medium: { base: '#F5D0B0', shadow: '#E5C0A0' },
  tan: { base: '#D4A574', shadow: '#C49564' },
  dark: { base: '#A67C52', shadow: '#966C42' },
};

// 髪色
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

// 服の色
const topColors: Record<string, { base: string; shadow: string; accent: string }> = {
  default: { base: '#7EB5A6', shadow: '#5E9585', accent: '#FFFFFF' },
  striped: { base: '#E57373', shadow: '#C55555', accent: '#FFFFFF' },
  star: { base: '#64B5F6', shadow: '#4595D6', accent: '#FFD700' },
  heart: { base: '#F48FB1', shadow: '#D47090', accent: '#E91E63' },
};

const sizes = {
  sm: 100,
  md: 150,
  lg: 200,
  xl: 280,
};

// デフォルト値
const getAppearanceWithDefaults = (appearance: Partial<AvatarAppearance>): AvatarAppearance => ({
  hairStyle: appearance.hairStyle || 'medium',
  hairColor: appearance.hairColor || 'brown',
  skinTone: appearance.skinTone || 'light',
  faceShape: appearance.faceShape || 'round',
  eyeShape: appearance.eyeShape || 'round',
  eyeColor: appearance.eyeColor || 'brown',
  eyebrowShape: appearance.eyebrowShape || 'natural',
  noseShape: appearance.noseShape || 'small',
  mouthShape: appearance.mouthShape || 'small',
  earSize: appearance.earSize || 'medium',
  blush: appearance.blush || 'light',
  faceFeature: appearance.faceFeature || 'none',
});

export default function Avatar({
  appearance: rawAppearance,
  expression = 'happy',
  equipped = {},
  size = 'lg',
  className = '',
}: AvatarProps) {
  const appearance = getAppearanceWithDefaults(rawAppearance);
  const skin = skinColors[appearance.skinTone];
  const hairColor = hairColors[appearance.hairColor];
  const top = topColors[equipped.top || 'default'];
  const svgSize = sizes[size];

  // 口の形（表情による）
  const getMouthPath = () => {
    switch (expression) {
      case 'excited':
        return 'M 72 88 Q 80 96 88 88'; // 大きな笑顔
      case 'happy':
      case 'proud':
        return 'M 74 86 Q 80 92 86 86'; // にっこり
      case 'thinking':
        return 'M 76 87 Q 80 85 84 87'; // ちょっと考え中
      default:
        return 'M 75 87 L 85 87'; // 普通
    }
  };

  // 髪型
  const getHair = (isBack: boolean) => {
    const color = hairColor;

    switch (appearance.hairStyle) {
      case 'short':
        if (isBack) {
          return <ellipse cx="80" cy="48" rx="40" ry="36" fill={color} />;
        }
        return (
          <path d="M 44 58 C 44 28, 80 22, 80 22 C 80 22, 116 28, 116 58 L 110 58 C 108 48, 95 45, 80 45 C 65 45, 52 48, 50 58 Z" fill={color} />
        );
      case 'medium':
        if (isBack) {
          return (
            <>
              <ellipse cx="80" cy="48" rx="44" ry="38" fill={color} />
              <ellipse cx="42" cy="88" rx="16" ry="35" fill={color} />
              <ellipse cx="118" cy="88" rx="16" ry="35" fill={color} />
            </>
          );
        }
        return (
          <path d="M 40 65 C 40 25, 80 18, 80 18 C 80 18, 120 25, 120 65 L 112 62 C 110 50, 95 45, 80 45 C 65 45, 50 50, 48 62 Z" fill={color} />
        );
      case 'long':
        if (isBack) {
          return (
            <>
              <ellipse cx="80" cy="48" rx="46" ry="40" fill={color} />
              <ellipse cx="38" cy="115" rx="20" ry="70" fill={color} />
              <ellipse cx="122" cy="115" rx="20" ry="70" fill={color} />
            </>
          );
        }
        return (
          <path d="M 36 70 C 36 22, 80 15, 80 15 C 80 15, 124 22, 124 70 L 115 65 C 112 50, 96 45, 80 45 C 64 45, 48 50, 45 65 Z" fill={color} />
        );
      case 'ponytail':
        if (isBack) {
          return (
            <>
              <ellipse cx="80" cy="48" rx="42" ry="36" fill={color} />
              <ellipse cx="120" cy="42" rx="18" ry="22" fill={color} />
              <path d="M 120 64 Q 135 115 128 175" stroke={color} strokeWidth="24" fill="none" strokeLinecap="round" />
            </>
          );
        }
        return (
          <>
            <path d="M 42 62 C 42 25, 80 18, 80 18 C 80 18, 118 25, 118 62 L 110 58 C 108 48, 94 44, 80 44 C 66 44, 52 48, 50 58 Z" fill={color} />
            <circle cx="120" cy="45" r="10" fill="#FF8A8A" />
          </>
        );
      case 'twintail':
        if (isBack) {
          return (
            <>
              <ellipse cx="80" cy="48" rx="42" ry="36" fill={color} />
              <ellipse cx="35" cy="58" rx="18" ry="20" fill={color} />
              <ellipse cx="125" cy="58" rx="18" ry="20" fill={color} />
              <path d="M 35 78 Q 20 125 28 175" stroke={color} strokeWidth="22" fill="none" strokeLinecap="round" />
              <path d="M 125 78 Q 140 125 132 175" stroke={color} strokeWidth="22" fill="none" strokeLinecap="round" />
            </>
          );
        }
        return (
          <>
            <path d="M 42 62 C 42 25, 80 18, 80 18 C 80 18, 118 25, 118 62 L 110 58 C 108 48, 94 44, 80 44 C 66 44, 52 48, 50 58 Z" fill={color} />
            <circle cx="35" cy="60" r="9" fill="#FF8A8A" />
            <circle cx="125" cy="60" r="9" fill="#FF8A8A" />
          </>
        );
      case 'curly':
        if (isBack) {
          return (
            <>
              <ellipse cx="80" cy="45" rx="42" ry="38" fill={color} />
              <circle cx="42" cy="62" r="22" fill={color} />
              <circle cx="118" cy="62" r="22" fill={color} />
              <circle cx="36" cy="95" r="18" fill={color} />
              <circle cx="124" cy="95" r="18" fill={color} />
            </>
          );
        }
        return (
          <>
            <circle cx="52" cy="35" r="18" fill={color} />
            <circle cx="80" cy="28" r="20" fill={color} />
            <circle cx="108" cy="35" r="18" fill={color} />
          </>
        );
      case 'spiky':
        if (isBack) {
          return <ellipse cx="80" cy="50" rx="42" ry="34" fill={color} />;
        }
        return (
          <>
            <path d="M 50 52 L 42 15 L 58 48" fill={color} />
            <path d="M 62 46 L 58 8 L 72 42" fill={color} />
            <path d="M 80 44 L 80 2 L 85 42" fill={color} />
            <path d="M 98 46 L 102 8 L 88 42" fill={color} />
            <path d="M 110 52 L 118 15 L 102 48" fill={color} />
            <path d="M 44 62 C 44 40, 80 35, 80 35 C 80 35, 116 40, 116 62 L 108 58 C 105 50, 92 47, 80 47 C 68 47, 55 50, 52 58 Z" fill={color} />
          </>
        );
      case 'bob':
        if (isBack) {
          return (
            <>
              <ellipse cx="80" cy="48" rx="46" ry="40" fill={color} />
              <ellipse cx="40" cy="82" rx="18" ry="30" fill={color} />
              <ellipse cx="120" cy="82" rx="18" ry="30" fill={color} />
            </>
          );
        }
        return (
          <path d="M 36 75 C 36 22, 80 16, 80 16 C 80 16, 124 22, 124 75 L 115 70 C 112 52, 96 46, 80 46 C 64 46, 48 52, 45 70 Z" fill={color} />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      <svg width={svgSize} height={svgSize * 1.4} viewBox="0 0 160 224">
        {/* 髪の毛（後ろ） */}
        {getHair(true)}

        {/* 足 */}
        <ellipse cx="65" cy="210" rx="14" ry="8" fill="#5C3D2E" />
        <ellipse cx="95" cy="210" rx="14" ry="8" fill="#5C3D2E" />
        <path d="M 65 165 L 65 205" stroke={skin.base} strokeWidth="16" strokeLinecap="round" />
        <path d="M 95 165 L 95 205" stroke={skin.base} strokeWidth="16" strokeLinecap="round" />

        {/* 腕 */}
        <path d="M 48 130 Q 35 145 32 165" stroke={skin.base} strokeWidth="14" fill="none" strokeLinecap="round" />
        <ellipse cx="32" cy="170" rx="8" ry="10" fill={skin.base} />
        <path d="M 112 130 Q 125 145 128 165" stroke={skin.base} strokeWidth="14" fill="none" strokeLinecap="round" />
        <ellipse cx="128" cy="170" rx="8" ry="10" fill={skin.base} />

        {/* 体 */}
        <path
          d="M 52 118 Q 48 130 50 165 L 110 165 Q 112 130 108 118 Q 95 112 80 112 Q 65 112 52 118"
          fill={top.base}
        />
        {/* 服の影 */}
        <path d="M 55 125 Q 52 145 54 160" stroke={top.shadow} strokeWidth="6" fill="none" opacity="0.4" />
        {/* 襟 */}
        <path d="M 62 115 L 80 128 L 98 115" fill="#FFFFFF" />
        {/* 服の模様 */}
        {equipped.top === 'star' && <text x="80" y="150" textAnchor="middle" fontSize="22" fill={top.accent}>★</text>}
        {equipped.top === 'heart' && <text x="80" y="150" textAnchor="middle" fontSize="22" fill={top.accent}>♥</text>}
        {equipped.top === 'striped' && (
          <>
            <path d="M 52 138 Q 80 135 108 138" stroke="#FFFFFF" strokeWidth="5" fill="none" />
            <path d="M 51 152 Q 80 149 109 152" stroke="#FFFFFF" strokeWidth="5" fill="none" />
          </>
        )}

        {/* 首 */}
        <rect x="72" y="100" width="16" height="18" fill={skin.base} />

        {/* 顔 */}
        <ellipse cx="80" cy="65" rx="36" ry="40" fill={skin.base} />

        {/* 頬の赤み */}
        <ellipse cx="52" cy="75" rx="10" ry="6" fill="#FFAEB0" opacity="0.5" />
        <ellipse cx="108" cy="75" rx="10" ry="6" fill="#FFAEB0" opacity="0.5" />

        {/* 目（常にシンプルな丸い目） */}
        <circle cx="65" cy="65" r="5" fill="#2D2D2D" />
        <circle cx="95" cy="65" r="5" fill="#2D2D2D" />
        {/* 目のハイライト */}
        <circle cx="66.5" cy="63.5" r="2" fill="#FFFFFF" />
        <circle cx="96.5" cy="63.5" r="2" fill="#FFFFFF" />

        {/* 口 */}
        <path d={getMouthPath()} stroke="#D4726A" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* 髪の毛（前） */}
        {getHair(false)}

        {/* 帽子 */}
        {equipped.hat === 'cap' && (
          <>
            <ellipse cx="80" cy="32" rx="40" ry="16" fill="#5B8FB9" />
            <path d="M 42 32 Q 80 5 118 32" fill="#5B8FB9" />
            <path d="M 38 35 L 65 40" stroke="#3D6F99" strokeWidth="6" strokeLinecap="round" />
          </>
        )}
        {equipped.hat === 'ribbon' && (
          <>
            <path d="M 55 28 Q 40 15 48 0 Q 58 12 62 25" fill="#F48FB1" />
            <path d="M 75 28 Q 90 15 82 0 Q 72 12 68 25" fill="#F48FB1" />
            <ellipse cx="65" cy="28" rx="9" ry="7" fill="#E91E63" />
          </>
        )}
        {equipped.hat === 'crown' && (
          <path d="M 48 40 L 55 8 L 67 28 L 80 2 L 93 28 L 105 8 L 112 40 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="2" />
        )}

        {/* アクセサリー */}
        {equipped.accessory === 'glasses' && (
          <>
            <ellipse cx="65" cy="70" rx="12" ry="10" fill="none" stroke="#4A4A4A" strokeWidth="2" />
            <ellipse cx="95" cy="70" rx="12" ry="10" fill="none" stroke="#4A4A4A" strokeWidth="2" />
            <path d="M 77 70 L 83 70" stroke="#4A4A4A" strokeWidth="2" />
          </>
        )}
        {equipped.accessory === 'necklace' && (
          <>
            <path d="M 60 112 Q 80 122 100 112" stroke="#FFD700" strokeWidth="2.5" fill="none" />
            <ellipse cx="80" cy="120" rx="6" ry="8" fill="#E91E63" />
          </>
        )}

        {/* エフェクト */}
        {equipped.effect === 'sparkle' && (
          <>
            <polygon points="15,40 17,45 22,45 18,48 20,53 15,50 10,53 12,48 8,45 13,45" fill="#FFD700" className="animate-pulse" />
            <polygon points="145,50 147,55 152,55 148,58 150,63 145,60 140,63 142,58 138,55 143,55" fill="#FFD700" className="animate-pulse" />
          </>
        )}
        {equipped.effect === 'hearts' && (
          <>
            <text x="12" y="45" fontSize="14" className="animate-bounce">💕</text>
            <text x="138" y="55" fontSize="12" className="animate-bounce">💕</text>
          </>
        )}
        {equipped.effect === 'stars' && (
          <>
            <text x="10" y="45" fontSize="16">⭐</text>
            <text x="140" y="55" fontSize="14">⭐</text>
          </>
        )}
      </svg>
    </div>
  );
}
