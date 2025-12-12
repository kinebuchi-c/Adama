'use client';

import {
  AvatarAppearance,
  Expression,
  HairStyle,
  HairColor,
  SkinTone,
  FaceShape,
  EyeShape,
  EyeColor,
  EyebrowShape,
  NoseShape,
  MouthShape,
  EarSize,
  Blush,
  FaceFeature,
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

// 色定義
const skinColors: Record<SkinTone, { base: string; shadow: string; highlight: string }> = {
  light: { base: '#FFECD2', shadow: '#E8D4BC', highlight: '#FFF5E9' },
  medium: { base: '#F5D0B0', shadow: '#DEB89A', highlight: '#FFE4CC' },
  tan: { base: '#D4A574', shadow: '#B8895C', highlight: '#E8BF94' },
  dark: { base: '#A67C52', shadow: '#8A6642', highlight: '#C49A70' },
};

const hairColors: Record<HairColor, { base: string; shadow: string; highlight: string }> = {
  black: { base: '#2D2D2D', shadow: '#1A1A1A', highlight: '#4A4A4A' },
  brown: { base: '#5C3D2E', shadow: '#3D2820', highlight: '#7A5545' },
  blonde: { base: '#E8C872', shadow: '#D4B45E', highlight: '#F5DC98' },
  red: { base: '#B85C38', shadow: '#8E4528', highlight: '#D47A55' },
  blue: { base: '#5B8FB9', shadow: '#4A7599', highlight: '#7BB0D4' },
  pink: { base: '#E893B8', shadow: '#D07AA0', highlight: '#F5B0CC' },
  green: { base: '#6B9080', shadow: '#557568', highlight: '#8BB0A0' },
  purple: { base: '#9B7BB8', shadow: '#7A5A98', highlight: '#B89DD0' },
  orange: { base: '#E8945C', shadow: '#C87840', highlight: '#F5B088' },
};

const eyeColors: Record<EyeColor, string> = {
  black: '#1A1A1A',
  brown: '#5C3D2E',
  blue: '#4A90D9',
  green: '#52B788',
  hazel: '#8B7355',
  gray: '#6B7280',
};

const topColors: Record<string, { base: string; shadow: string }> = {
  default: { base: '#7EB5A6', shadow: '#5E9585' },
  striped: { base: '#E57373', shadow: '#C55555' },
  star: { base: '#64B5F6', shadow: '#4595D6' },
  heart: { base: '#F48FB1', shadow: '#D47090' },
};

const sizes = {
  sm: 80,
  md: 120,
  lg: 180,
  xl: 250,
};

// デフォルト値を設定するヘルパー
const getAppearanceWithDefaults = (appearance: Partial<AvatarAppearance>): AvatarAppearance => ({
  hairStyle: appearance.hairStyle || 'medium',
  hairColor: appearance.hairColor || 'brown',
  skinTone: appearance.skinTone || 'medium',
  faceShape: appearance.faceShape || 'round',
  eyeShape: appearance.eyeShape || 'round',
  eyeColor: appearance.eyeColor || 'brown',
  eyebrowShape: appearance.eyebrowShape || 'natural',
  eyebrowColor: appearance.eyebrowColor,
  noseShape: appearance.noseShape || 'small',
  mouthShape: appearance.mouthShape || 'small',
  earSize: appearance.earSize || 'medium',
  blush: appearance.blush || 'light',
  faceFeature: appearance.faceFeature || 'none',
  eyeStyle: appearance.eyeStyle,
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
  const hair = hairColors[appearance.hairColor];
  const eyeColor = eyeColors[appearance.eyeColor];
  const eyebrowColor = appearance.eyebrowColor ? hairColors[appearance.eyebrowColor] : hair;
  const top = topColors[equipped.top || 'default'];
  const svgSize = sizes[size];

  // 顔の形
  const getFaceShape = () => {
    const shapes: Record<FaceShape, string> = {
      round: 'M 80 15 Q 125 15, 125 65 Q 125 115, 80 118 Q 35 115, 35 65 Q 35 15, 80 15',
      oval: 'M 80 12 Q 120 15, 122 65 Q 120 118, 80 122 Q 40 118, 38 65 Q 40 15, 80 12',
      square: 'M 80 18 Q 118 18, 120 60 Q 120 108, 80 115 Q 40 108, 40 60 Q 42 18, 80 18',
      heart: 'M 80 15 Q 125 12, 122 58 Q 118 105, 80 120 Q 42 105, 38 58 Q 35 12, 80 15',
    };
    return shapes[appearance.faceShape];
  };

  // 目の形
  const getEyes = () => {
    const eyeY = 68;
    const leftEyeX = 62;
    const rightEyeX = 98;

    if (expression === 'happy' || expression === 'excited') {
      // にっこり閉じ目
      const curveHeight = expression === 'excited' ? 8 : 6;
      return (
        <>
          <path d={`M ${leftEyeX - 8} ${eyeY} Q ${leftEyeX} ${eyeY - curveHeight}, ${leftEyeX + 8} ${eyeY}`}
                stroke="#2D2D2D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d={`M ${rightEyeX - 8} ${eyeY} Q ${rightEyeX} ${eyeY - curveHeight}, ${rightEyeX + 8} ${eyeY}`}
                stroke="#2D2D2D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      );
    }

    // 目のサイズと形状
    const eyeSizes: Record<EyeShape, { rx: number; ry: number }> = {
      round: { rx: 7, ry: 8 },
      almond: { rx: 9, ry: 6 },
      droopy: { rx: 7, ry: 7 },
      upturned: { rx: 7, ry: 7 },
      big: { rx: 10, ry: 11 },
      small: { rx: 5, ry: 6 },
    };
    const eyeSize = eyeSizes[appearance.eyeShape];
    const pupilSize = Math.min(eyeSize.rx, eyeSize.ry) * 0.6;

    return (
      <>
        {/* 白目 */}
        <ellipse cx={leftEyeX} cy={eyeY} rx={eyeSize.rx} ry={eyeSize.ry} fill="white" />
        <ellipse cx={rightEyeX} cy={eyeY} rx={eyeSize.rx} ry={eyeSize.ry} fill="white" />
        {/* 虹彩 */}
        <ellipse cx={leftEyeX} cy={eyeY + 1} rx={pupilSize + 1} ry={pupilSize + 1} fill={eyeColor} />
        <ellipse cx={rightEyeX} cy={eyeY + 1} rx={pupilSize + 1} ry={pupilSize + 1} fill={eyeColor} />
        {/* 瞳孔 */}
        <ellipse cx={leftEyeX} cy={eyeY + 1} rx={pupilSize * 0.5} ry={pupilSize * 0.5} fill="#1A1A1A" />
        <ellipse cx={rightEyeX} cy={eyeY + 1} rx={pupilSize * 0.5} ry={pupilSize * 0.5} fill="#1A1A1A" />
        {/* ハイライト */}
        <ellipse cx={leftEyeX + 2} cy={eyeY - 2} rx={2} ry={2} fill="white" />
        <ellipse cx={rightEyeX + 2} cy={eyeY - 2} rx={2} ry={2} fill="white" />
        {/* まつげ（上向きの目の場合） */}
        {appearance.eyeShape === 'upturned' && (
          <>
            <path d={`M ${leftEyeX - 8} ${eyeY - 5} L ${leftEyeX - 10} ${eyeY - 10}`} stroke="#2D2D2D" strokeWidth="1.5" />
            <path d={`M ${rightEyeX + 8} ${eyeY - 5} L ${rightEyeX + 10} ${eyeY - 10}`} stroke="#2D2D2D" strokeWidth="1.5" />
          </>
        )}
        {/* たれ目の場合 */}
        {appearance.eyeShape === 'droopy' && (
          <>
            <path d={`M ${leftEyeX + 6} ${eyeY - 6} L ${leftEyeX + 10} ${eyeY - 4}`} stroke="#2D2D2D" strokeWidth="1.5" />
            <path d={`M ${rightEyeX - 6} ${eyeY - 6} L ${rightEyeX - 10} ${eyeY - 4}`} stroke="#2D2D2D" strokeWidth="1.5" />
          </>
        )}
      </>
    );
  };

  // 眉毛
  const getEyebrows = () => {
    const browY = 55;
    const leftBrowX = 62;
    const rightBrowX = 98;

    const browPaths: Record<EyebrowShape, { left: string; right: string; width: number }> = {
      natural: {
        left: `M ${leftBrowX - 10} ${browY + 2} Q ${leftBrowX} ${browY - 3}, ${leftBrowX + 10} ${browY + 1}`,
        right: `M ${rightBrowX - 10} ${browY + 1} Q ${rightBrowX} ${browY - 3}, ${rightBrowX + 10} ${browY + 2}`,
        width: 2,
      },
      arched: {
        left: `M ${leftBrowX - 10} ${browY + 4} Q ${leftBrowX} ${browY - 6}, ${leftBrowX + 10} ${browY + 2}`,
        right: `M ${rightBrowX - 10} ${browY + 2} Q ${rightBrowX} ${browY - 6}, ${rightBrowX + 10} ${browY + 4}`,
        width: 2,
      },
      straight: {
        left: `M ${leftBrowX - 10} ${browY} L ${leftBrowX + 10} ${browY}`,
        right: `M ${rightBrowX - 10} ${browY} L ${rightBrowX + 10} ${browY}`,
        width: 2.5,
      },
      thick: {
        left: `M ${leftBrowX - 10} ${browY + 2} Q ${leftBrowX} ${browY - 4}, ${leftBrowX + 10} ${browY + 1}`,
        right: `M ${rightBrowX - 10} ${browY + 1} Q ${rightBrowX} ${browY - 4}, ${rightBrowX + 10} ${browY + 2}`,
        width: 4,
      },
      thin: {
        left: `M ${leftBrowX - 8} ${browY + 1} Q ${leftBrowX} ${browY - 2}, ${leftBrowX + 8} ${browY}`,
        right: `M ${rightBrowX - 8} ${browY} Q ${rightBrowX} ${browY - 2}, ${rightBrowX + 8} ${browY + 1}`,
        width: 1.5,
      },
    };

    const brow = browPaths[appearance.eyebrowShape];

    // 表情による調整
    let transform = '';
    if (expression === 'thinking') {
      transform = 'translate(0, -2)';
    }

    return (
      <g transform={transform}>
        <path d={brow.left} stroke={eyebrowColor.base} strokeWidth={brow.width} fill="none" strokeLinecap="round" />
        <path d={brow.right} stroke={eyebrowColor.base} strokeWidth={brow.width} fill="none" strokeLinecap="round" />
      </g>
    );
  };

  // 鼻
  const getNose = () => {
    const noseY = 82;
    const nosePaths: Record<NoseShape, JSX.Element> = {
      small: <ellipse cx="80" cy={noseY} rx="3" ry="3" fill={skin.shadow} opacity="0.3" />,
      medium: <ellipse cx="80" cy={noseY} rx="4" ry="5" fill={skin.shadow} opacity="0.35" />,
      round: (
        <>
          <ellipse cx="80" cy={noseY} rx="5" ry="5" fill={skin.shadow} opacity="0.25" />
          <ellipse cx="80" cy={noseY + 2} rx="3" ry="2" fill={skin.shadow} opacity="0.2" />
        </>
      ),
      pointed: (
        <path d={`M 80 ${noseY - 8} L 84 ${noseY + 2} L 76 ${noseY + 2} Z`} fill={skin.shadow} opacity="0.25" />
      ),
    };
    return nosePaths[appearance.noseShape];
  };

  // 口
  const getMouth = () => {
    const mouthY = 95;

    if (expression === 'excited') {
      return (
        <>
          <ellipse cx="80" cy={mouthY} rx="10" ry="8" fill="#2D2D2D" />
          <ellipse cx="80" cy={mouthY - 2} rx="6" ry="4" fill="#FF8A8A" />
        </>
      );
    }
    if (expression === 'thinking') {
      return <ellipse cx="84" cy={mouthY} rx="5" ry="4" fill="#2D2D2D" />;
    }

    const mouthWidths: Record<MouthShape, number> = {
      small: 10,
      medium: 14,
      wide: 18,
      heart: 12,
    };
    const width = mouthWidths[appearance.mouthShape];

    if (expression === 'happy' || expression === 'proud') {
      if (appearance.mouthShape === 'heart') {
        return (
          <path d={`M ${80 - width/2} ${mouthY - 2} Q 80 ${mouthY + 8}, ${80 + width/2} ${mouthY - 2}`}
                stroke="#2D2D2D" strokeWidth="2" fill="none" strokeLinecap="round" />
        );
      }
      return (
        <path d={`M ${80 - width/2} ${mouthY - 3} Q 80 ${mouthY + 6}, ${80 + width/2} ${mouthY - 3}`}
              stroke="#2D2D2D" strokeWidth="2" fill="none" strokeLinecap="round" />
      );
    }

    // neutral
    return (
      <path d={`M ${80 - width/2 + 2} ${mouthY} L ${80 + width/2 - 2} ${mouthY}`}
            stroke="#2D2D2D" strokeWidth="2" fill="none" strokeLinecap="round" />
    );
  };

  // 耳
  const getEars = () => {
    const earSizes: Record<EarSize, { rx: number; ry: number }> = {
      small: { rx: 6, ry: 10 },
      medium: { rx: 8, ry: 14 },
      large: { rx: 10, ry: 18 },
    };
    const ear = earSizes[appearance.earSize];

    return (
      <>
        <ellipse cx="35" cy="70" rx={ear.rx} ry={ear.ry} fill={skin.base} />
        <ellipse cx="35" cy="70" rx={ear.rx * 0.6} ry={ear.ry * 0.7} fill={skin.shadow} opacity="0.2" />
        <ellipse cx="125" cy="70" rx={ear.rx} ry={ear.ry} fill={skin.base} />
        <ellipse cx="125" cy="70" rx={ear.rx * 0.6} ry={ear.ry * 0.7} fill={skin.shadow} opacity="0.2" />
      </>
    );
  };

  // 頬紅
  const getBlush = () => {
    const blushOpacity: Record<Blush, number> = {
      none: 0,
      light: 0.3,
      medium: 0.5,
      strong: 0.7,
    };
    const opacity = blushOpacity[appearance.blush];
    if (opacity === 0) return null;

    return (
      <>
        <ellipse cx="50" cy="85" rx="12" ry="7" fill="#FFB6C1" opacity={opacity} />
        <ellipse cx="110" cy="85" rx="12" ry="7" fill="#FFB6C1" opacity={opacity} />
      </>
    );
  };

  // 顔の特徴
  const getFaceFeatures = () => {
    switch (appearance.faceFeature) {
      case 'freckles':
        return (
          <>
            <circle cx="55" cy="78" r="1.5" fill="#C4956A" opacity="0.5" />
            <circle cx="60" cy="82" r="1.5" fill="#C4956A" opacity="0.5" />
            <circle cx="52" cy="84" r="1.5" fill="#C4956A" opacity="0.5" />
            <circle cx="100" cy="78" r="1.5" fill="#C4956A" opacity="0.5" />
            <circle cx="105" cy="82" r="1.5" fill="#C4956A" opacity="0.5" />
            <circle cx="108" cy="84" r="1.5" fill="#C4956A" opacity="0.5" />
          </>
        );
      case 'mole':
        return <circle cx="95" cy="90" r="2" fill="#5C3D2E" />;
      case 'dimples':
        return (
          <>
            <ellipse cx="55" cy="92" rx="3" ry="2" fill={skin.shadow} opacity="0.2" />
            <ellipse cx="105" cy="92" rx="3" ry="2" fill={skin.shadow} opacity="0.2" />
          </>
        );
      case 'beauty_mark':
        return <circle cx="108" cy="75" r="2" fill="#3D2820" />;
      default:
        return null;
    }
  };

  // 髪型
  const getHair = () => {
    switch (appearance.hairStyle) {
      case 'short':
        return (
          <>
            <ellipse cx="80" cy="42" rx="42" ry="30" fill={hair.base} />
            <path d="M 42 55 Q 45 35, 60 30 Q 80 25, 100 30 Q 115 35, 118 55" fill={hair.base} />
            <path d="M 55 35 Q 65 28, 80 30" stroke={hair.highlight} strokeWidth="4" fill="none" opacity="0.5" />
          </>
        );
      case 'medium':
        return (
          <>
            <path d="M 38 60 Q 32 100, 40 130" fill={hair.base} />
            <path d="M 122 60 Q 128 100, 120 130" fill={hair.base} />
            <ellipse cx="80" cy="40" rx="45" ry="32" fill={hair.base} />
            <path d="M 38 58 Q 42 30, 65 22 Q 80 18, 95 22 Q 118 30, 122 58" fill={hair.base} />
            <ellipse cx="38" cy="80" rx="10" ry="35" fill={hair.base} />
            <ellipse cx="122" cy="80" rx="10" ry="35" fill={hair.base} />
            <path d="M 50 30 Q 65 22, 85 25" stroke={hair.highlight} strokeWidth="5" fill="none" opacity="0.5" />
          </>
        );
      case 'long':
        return (
          <>
            <path d="M 32 55 Q 22 120, 30 200 Q 35 220, 45 225" fill={hair.base} />
            <path d="M 128 55 Q 138 120, 130 200 Q 125 220, 115 225" fill={hair.base} />
            <ellipse cx="80" cy="38" rx="48" ry="34" fill={hair.base} />
            <path d="M 35 60 Q 38 28, 60 18 Q 80 12, 100 18 Q 122 28, 125 60" fill={hair.base} />
            <path d="M 35 60 Q 28 100, 32 160 Q 34 200, 40 220" fill={hair.base} />
            <path d="M 125 60 Q 132 100, 128 160 Q 126 200, 120 220" fill={hair.base} />
            <path d="M 48 28 Q 65 18, 90 22" stroke={hair.highlight} strokeWidth="6" fill="none" opacity="0.5" />
          </>
        );
      case 'ponytail':
        return (
          <>
            <ellipse cx="125" cy="45" rx="18" ry="22" fill={hair.base} />
            <path d="M 125 67 Q 140 110, 130 170" fill={hair.base} />
            <ellipse cx="80" cy="42" rx="42" ry="30" fill={hair.base} />
            <path d="M 42 55 Q 45 32, 60 25 Q 80 20, 100 25 Q 115 32, 118 55" fill={hair.base} />
            <ellipse cx="125" cy="50" rx="6" ry="8" fill="#FF8A8A" />
            <path d="M 55 32 Q 70 24, 88 28" stroke={hair.highlight} strokeWidth="4" fill="none" opacity="0.5" />
          </>
        );
      case 'twintail':
        return (
          <>
            <ellipse cx="35" cy="60" rx="14" ry="18" fill={hair.base} />
            <ellipse cx="125" cy="60" rx="14" ry="18" fill={hair.base} />
            <path d="M 35 78 Q 22 120, 28 180" fill={hair.base} />
            <path d="M 125 78 Q 138 120, 132 180" fill={hair.base} />
            <ellipse cx="80" cy="40" rx="44" ry="32" fill={hair.base} />
            <path d="M 40 58 Q 44 30, 62 22 Q 80 17, 98 22 Q 116 30, 120 58" fill={hair.base} />
            <ellipse cx="38" cy="62" rx="5" ry="6" fill="#FF8A8A" />
            <ellipse cx="122" cy="62" rx="5" ry="6" fill="#FF8A8A" />
            <path d="M 52 28 Q 68 20, 88 24" stroke={hair.highlight} strokeWidth="5" fill="none" opacity="0.5" />
          </>
        );
      case 'curly':
        return (
          <>
            <ellipse cx="80" cy="38" rx="50" ry="35" fill={hair.base} />
            <circle cx="38" cy="55" r="16" fill={hair.base} />
            <circle cx="122" cy="55" r="16" fill={hair.base} />
            <circle cx="32" cy="80" r="14" fill={hair.base} />
            <circle cx="128" cy="80" r="14" fill={hair.base} />
            <circle cx="36" cy="108" r="12" fill={hair.base} />
            <circle cx="124" cy="108" r="12" fill={hair.base} />
            <circle cx="55" cy="35" r="12" fill={hair.base} />
            <circle cx="80" cy="28" r="14" fill={hair.base} />
            <circle cx="105" cy="35" r="12" fill={hair.base} />
            <circle cx="75" cy="25" r="4" fill={hair.highlight} opacity="0.5" />
          </>
        );
      case 'spiky':
        return (
          <>
            <ellipse cx="80" cy="45" rx="40" ry="28" fill={hair.base} />
            <path d="M 50 35 L 45 10 L 55 30" fill={hair.base} />
            <path d="M 65 30 L 58 5 L 72 25" fill={hair.base} />
            <path d="M 80 28 L 80 0 L 85 25" fill={hair.base} />
            <path d="M 95 30 L 102 5 L 88 25" fill={hair.base} />
            <path d="M 110 35 L 115 10 L 105 30" fill={hair.base} />
            <path d="M 42 55 Q 48 35, 60 30 Q 80 25, 100 30 Q 112 35, 118 55" fill={hair.base} />
            <path d="M 70 15 L 72 8" stroke={hair.highlight} strokeWidth="3" opacity="0.5" />
          </>
        );
      case 'bob':
        return (
          <>
            <ellipse cx="80" cy="42" rx="48" ry="32" fill={hair.base} />
            <path d="M 35 55 Q 32 90, 40 115 Q 50 120, 60 115" fill={hair.base} />
            <path d="M 125 55 Q 128 90, 120 115 Q 110 120, 100 115" fill={hair.base} />
            <path d="M 35 58 Q 40 28, 60 20 Q 80 15, 100 20 Q 120 28, 125 58" fill={hair.base} />
            <path d="M 50 28 Q 68 18, 88 22" stroke={hair.highlight} strokeWidth="5" fill="none" opacity="0.5" />
          </>
        );
      default:
        return null;
    }
  };

  // 体
  const getBody = () => (
    <>
      <path d="M 68 110 Q 68 118, 70 125 L 90 125 Q 92 118, 92 110" fill={skin.base} />
      <path
        d="M 50 130 Q 45 145, 48 185 Q 50 215, 55 235 L 105 235 Q 110 215, 112 185 Q 115 145, 110 130 Q 95 123, 80 123 Q 65 123, 50 130"
        fill={top.base}
      />
      <path d="M 55 135 Q 52 165, 55 205" stroke={top.shadow} strokeWidth="8" fill="none" opacity="0.4" />
      <path d="M 62 127 L 80 143 L 98 127" fill="white" stroke={top.shadow} strokeWidth="1" />
      {equipped.top === 'star' && <text x="80" y="185" textAnchor="middle" fontSize="28" fill="#FFD700">★</text>}
      {equipped.top === 'heart' && <text x="80" y="185" textAnchor="middle" fontSize="28" fill="#E91E63">♥</text>}
      {equipped.top === 'striped' && (
        <>
          <path d="M 52 155 Q 80 150, 108 155" stroke="white" strokeWidth="6" fill="none" />
          <path d="M 50 180 Q 80 175, 110 180" stroke="white" strokeWidth="6" fill="none" />
          <path d="M 52 205 Q 80 200, 108 205" stroke="white" strokeWidth="6" fill="none" />
        </>
      )}
    </>
  );

  // 腕
  const getArms = () => (
    <>
      <path d="M 50 133 Q 35 150, 30 175 Q 28 190, 32 200" stroke={skin.base} strokeWidth="18" fill="none" strokeLinecap="round" />
      <ellipse cx="32" cy="205" rx="10" ry="12" fill={skin.base} />
      <path d="M 110 133 Q 125 150, 130 175 Q 132 190, 128 200" stroke={skin.base} strokeWidth="18" fill="none" strokeLinecap="round" />
      <ellipse cx="128" cy="205" rx="10" ry="12" fill={skin.base} />
    </>
  );

  // 足
  const getLegs = () => (
    <>
      <path d="M 60 233 Q 58 265, 55 295 Q 54 315, 58 325" stroke={skin.base} strokeWidth="20" fill="none" strokeLinecap="round" />
      <ellipse cx="58" cy="333" rx="18" ry="10" fill="#5C3D2E" />
      <path d="M 100 233 Q 102 265, 105 295 Q 106 315, 102 325" stroke={skin.base} strokeWidth="20" fill="none" strokeLinecap="round" />
      <ellipse cx="102" cy="333" rx="18" ry="10" fill="#5C3D2E" />
    </>
  );

  // 帽子
  const getHat = () => {
    if (!equipped.hat) return null;
    switch (equipped.hat) {
      case 'cap':
        return (
          <>
            <ellipse cx="80" cy="25" rx="45" ry="18" fill="#5B8FB9" />
            <path d="M 38 25 Q 80 -5, 122 25" fill="#5B8FB9" />
            <path d="M 35 28 L 70 35" stroke="#3D6F99" strokeWidth="8" strokeLinecap="round" />
          </>
        );
      case 'ribbon':
        return (
          <>
            <path d="M 50 22 Q 32 8, 42 -8 Q 55 5, 60 18" fill="#F48FB1" />
            <path d="M 70 22 Q 88 8, 78 -8 Q 65 5, 60 18" fill="#F48FB1" />
            <ellipse cx="60" cy="22" rx="10" ry="8" fill="#E91E63" />
          </>
        );
      case 'crown':
        return (
          <path d="M 42 35 L 50 0 L 65 22 L 80 -5 L 95 22 L 110 0 L 118 35 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="2" />
        );
      default:
        return null;
    }
  };

  // アクセサリー
  const getAccessory = () => {
    if (!equipped.accessory) return null;
    switch (equipped.accessory) {
      case 'glasses':
        return (
          <>
            <ellipse cx="62" cy="70" rx="14" ry="12" fill="none" stroke="#4A4A4A" strokeWidth="2.5" />
            <ellipse cx="98" cy="70" rx="14" ry="12" fill="none" stroke="#4A4A4A" strokeWidth="2.5" />
            <path d="M 76 70 L 84 70" stroke="#4A4A4A" strokeWidth="2.5" />
          </>
        );
      case 'necklace':
        return (
          <>
            <path d="M 55 120 Q 80 135, 105 120" stroke="#FFD700" strokeWidth="3" fill="none" />
            <ellipse cx="80" cy="133" rx="8" ry="10" fill="#E91E63" />
          </>
        );
      case 'earrings':
        return (
          <>
            <circle cx="35" cy="85" r="6" fill="#FFD700" />
            <circle cx="35" cy="95" r="4" fill="#E91E63" />
            <circle cx="125" cy="85" r="6" fill="#FFD700" />
            <circle cx="125" cy="95" r="4" fill="#E91E63" />
          </>
        );
      default:
        return null;
    }
  };

  // エフェクト
  const getEffect = () => {
    if (!equipped.effect) return null;
    switch (equipped.effect) {
      case 'sparkle':
        return (
          <>
            <text x="15" y="50" fontSize="18" className="animate-pulse">✨</text>
            <text x="140" y="65" fontSize="16" className="animate-pulse">✨</text>
            <text x="20" y="180" fontSize="14" className="animate-pulse">✨</text>
          </>
        );
      case 'hearts':
        return (
          <>
            <text x="10" y="45" fontSize="16" className="animate-bounce">💕</text>
            <text x="140" y="60" fontSize="14" className="animate-bounce">💕</text>
          </>
        );
      case 'stars':
        return (
          <>
            <text x="8" y="50" fontSize="20">⭐</text>
            <text x="145" y="65" fontSize="16">⭐</text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      <svg width={svgSize} height={svgSize * 1.5} viewBox="0 0 160 345" xmlns="http://www.w3.org/2000/svg">
        {getEffect()}
        {['long', 'twintail', 'ponytail'].includes(appearance.hairStyle) && getHair()}
        {getLegs()}
        {getArms()}
        {getBody()}
        {getEars()}
        <path d={getFaceShape()} fill={skin.base} />
        <path d={getFaceShape()} fill={skin.highlight} opacity="0.2" transform="translate(0, -3) scale(0.95)" style={{ transformOrigin: 'center' }} />
        {!['long', 'twintail', 'ponytail'].includes(appearance.hairStyle) && getHair()}
        {getEyebrows()}
        {getEyes()}
        {getNose()}
        {getBlush()}
        {getMouth()}
        {getFaceFeatures()}
        {getAccessory()}
        {getHat()}
      </svg>
    </div>
  );
}
