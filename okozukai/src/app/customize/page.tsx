'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Avatar from '@/components/avatar/Avatar';
import { usePlayer } from '@/hooks/usePlayer';
import { useShop } from '@/hooks/useShop';
import {
  AvatarAppearance,
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
  Expression,
} from '@/types';

// 選択肢の定義
const hairStyles: { value: HairStyle; label: string }[] = [
  { value: 'short', label: 'ショート' },
  { value: 'medium', label: 'ミディアム' },
  { value: 'long', label: 'ロング' },
  { value: 'bob', label: 'ボブ' },
  { value: 'ponytail', label: 'ポニーテール' },
  { value: 'twintail', label: 'ツインテール' },
  { value: 'curly', label: 'くるくる' },
  { value: 'spiky', label: 'ツンツン' },
];

const hairColors: { value: HairColor; label: string; color: string }[] = [
  { value: 'black', label: '黒', color: '#2D2D2D' },
  { value: 'brown', label: '茶色', color: '#5C3D2E' },
  { value: 'blonde', label: '金', color: '#E8C872' },
  { value: 'red', label: '赤茶', color: '#B85C38' },
  { value: 'orange', label: 'オレンジ', color: '#E8945C' },
  { value: 'blue', label: '青', color: '#5B8FB9' },
  { value: 'pink', label: 'ピンク', color: '#E893B8' },
  { value: 'green', label: '緑', color: '#6B9080' },
  { value: 'purple', label: '紫', color: '#9B7BB8' },
];

const skinTones: { value: SkinTone; label: string; color: string }[] = [
  { value: 'light', label: '明るい', color: '#FFECD2' },
  { value: 'medium', label: 'ふつう', color: '#F5D0B0' },
  { value: 'tan', label: '小麦色', color: '#D4A574' },
  { value: 'dark', label: '濃い', color: '#A67C52' },
];

const faceShapes: { value: FaceShape; label: string }[] = [
  { value: 'round', label: '丸顔' },
  { value: 'oval', label: 'たまご型' },
  { value: 'square', label: '四角' },
  { value: 'heart', label: 'ハート型' },
];

const eyeShapes: { value: EyeShape; label: string }[] = [
  { value: 'round', label: '丸い目' },
  { value: 'almond', label: 'アーモンド' },
  { value: 'big', label: 'パッチリ' },
  { value: 'small', label: '小さめ' },
  { value: 'droopy', label: 'たれ目' },
  { value: 'upturned', label: 'つり目' },
];

const eyeColors: { value: EyeColor; label: string; color: string }[] = [
  { value: 'black', label: '黒', color: '#1A1A1A' },
  { value: 'brown', label: '茶色', color: '#5C3D2E' },
  { value: 'blue', label: '青', color: '#4A90D9' },
  { value: 'green', label: '緑', color: '#52B788' },
  { value: 'hazel', label: 'ヘーゼル', color: '#8B7355' },
  { value: 'gray', label: 'グレー', color: '#6B7280' },
];

const eyebrowShapes: { value: EyebrowShape; label: string }[] = [
  { value: 'natural', label: '自然' },
  { value: 'arched', label: 'アーチ' },
  { value: 'straight', label: 'まっすぐ' },
  { value: 'thick', label: '太め' },
  { value: 'thin', label: '細め' },
];

const noseShapes: { value: NoseShape; label: string }[] = [
  { value: 'small', label: '小さい' },
  { value: 'medium', label: 'ふつう' },
  { value: 'round', label: '丸い' },
  { value: 'pointed', label: 'とがった' },
];

const mouthShapes: { value: MouthShape; label: string }[] = [
  { value: 'small', label: '小さい' },
  { value: 'medium', label: 'ふつう' },
  { value: 'wide', label: '大きい' },
  { value: 'heart', label: 'ハート型' },
];

const earSizes: { value: EarSize; label: string }[] = [
  { value: 'small', label: '小さい' },
  { value: 'medium', label: 'ふつう' },
  { value: 'large', label: '大きい' },
];

const blushOptions: { value: Blush; label: string }[] = [
  { value: 'none', label: 'なし' },
  { value: 'light', label: 'うすい' },
  { value: 'medium', label: 'ふつう' },
  { value: 'strong', label: '濃い' },
];

const faceFeatures: { value: FaceFeature; label: string }[] = [
  { value: 'none', label: 'なし' },
  { value: 'freckles', label: 'そばかす' },
  { value: 'mole', label: 'ほくろ' },
  { value: 'dimples', label: 'えくぼ' },
  { value: 'beauty_mark', label: 'チャームポイント' },
];

const expressions: { value: Expression; label: string }[] = [
  { value: 'happy', label: 'にっこり' },
  { value: 'excited', label: 'わくわく' },
  { value: 'proud', label: 'どや顔' },
  { value: 'thinking', label: '考え中' },
  { value: 'neutral', label: 'ふつう' },
];

type TabType = 'face' | 'hair' | 'features' | 'clothes';

const defaultAppearance: AvatarAppearance = {
  hairStyle: 'medium',
  hairColor: 'brown',
  skinTone: 'medium',
  faceShape: 'round',
  eyeShape: 'round',
  eyeColor: 'brown',
  eyebrowShape: 'natural',
  noseShape: 'small',
  mouthShape: 'small',
  earSize: 'medium',
  blush: 'light',
  faceFeature: 'none',
};

export default function CustomizePage() {
  const { avatar, equippedItems, ownedItemIds, updateAvatar, equipItem, unequipItem, loading } = usePlayer();
  const { items: shopItems } = useShop();

  const [activeTab, setActiveTab] = useState<TabType>('face');
  const [appearance, setAppearance] = useState<AvatarAppearance>(defaultAppearance);
  const [expression, setExpression] = useState<Expression>('happy');
  const [equipped, setEquipped] = useState<{
    top?: string;
    hat?: string;
    accessory?: string;
    effect?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize from player data
  useEffect(() => {
    if (avatar) {
      setAppearance(avatar);
    }
    if (equippedItems) {
      setEquipped(equippedItems);
    }
  }, [avatar, equippedItems]);

  // Save avatar when appearance changes (debounced)
  const saveAppearance = useCallback(async (newAppearance: Partial<AvatarAppearance>) => {
    setIsSaving(true);
    try {
      await updateAvatar(newAppearance);
    } catch (error) {
      console.error('Failed to save avatar:', error);
    } finally {
      setIsSaving(false);
    }
  }, [updateAvatar]);

  // Get owned items by category
  const getOwnedByCategory = (category: string) => {
    return shopItems.filter(
      item => item.category === category && ownedItemIds.includes(item.id)
    );
  };

  const ownedHats = getOwnedByCategory('hat');
  const ownedTops = getOwnedByCategory('top');
  const ownedAccessories = getOwnedByCategory('accessory');
  const ownedEffects = getOwnedByCategory('effect');

  const tabs: { value: TabType; label: string; icon: string }[] = [
    { value: 'face', label: '顔', icon: '😊' },
    { value: 'hair', label: '髪', icon: '💇' },
    { value: 'features', label: '特徴', icon: '✨' },
    { value: 'clothes', label: '服飾', icon: '👕' },
  ];

  const updateAppearance = <K extends keyof AvatarAppearance>(key: K, value: AvatarAppearance[K]) => {
    const newAppearance = { ...appearance, [key]: value };
    setAppearance(newAppearance);
    saveAppearance({ [key]: value });
  };

  const toggleEquip = async (category: 'top' | 'hat' | 'accessory' | 'effect', itemId: string) => {
    const isCurrentlyEquipped = equipped[category] === itemId;
    setEquipped(prev => ({
      ...prev,
      [category]: isCurrentlyEquipped ? undefined : itemId,
    }));

    try {
      if (isCurrentlyEquipped) {
        await unequipItem(category);
      } else {
        await equipItem(itemId, category);
      }
    } catch (error) {
      console.error('Failed to update equipped item:', error);
    }
  };

  // 選択ボタンのコンポーネント
  const SelectButton = ({ selected, onClick, children, disabled = false }: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
        selected
          ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-700'
          : disabled
          ? 'bg-gray-100 border-2 border-transparent text-gray-400'
          : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  // 色選択ボタン
  const ColorButton = ({ color, selected, onClick, title }: {
    color: string;
    selected: boolean;
    onClick: () => void;
    title: string;
  }) => (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-full transition-all ${
        selected ? 'ring-4 ring-indigo-400 ring-offset-2' : 'hover:scale-110'
      }`}
      style={{ backgroundColor: color }}
      title={title}
    />
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">アバター設定</h1>
        <Link
          href="/shop"
          className="px-4 py-2 bg-pink-500 text-white text-sm font-bold rounded-xl hover:bg-pink-600 transition-colors"
        >
          🛍️ ショップ
        </Link>
      </div>

      {/* プレビュー */}
      <div className="bg-gradient-to-b from-sky-200 to-sky-100 rounded-3xl p-4 mb-4 flex flex-col items-center">
        <Avatar
          appearance={appearance}
          expression={expression}
          equipped={equipped}
          size="xl"
        />
        <p className="mt-2 text-gray-700 font-medium">たろう</p>

        {/* 表情選択 */}
        <div className="flex gap-2 mt-3 flex-wrap justify-center">
          {expressions.map((exp) => (
            <button
              key={exp.value}
              onClick={() => setExpression(exp.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                expression === exp.value
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              {exp.label}
            </button>
          ))}
        </div>
      </div>

      {/* タブ */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-1 ${
              activeTab === tab.value
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      <div className="bg-white rounded-2xl p-4 shadow space-y-5">
        {activeTab === 'face' && (
          <>
            {/* 顔の形 */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">顔の形</h3>
              <div className="flex gap-2 flex-wrap">
                {faceShapes.map((shape) => (
                  <SelectButton
                    key={shape.value}
                    selected={appearance.faceShape === shape.value}
                    onClick={() => updateAppearance('faceShape', shape.value)}
                  >
                    {shape.label}
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* 肌色 */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">肌の色</h3>
              <div className="flex gap-3">
                {skinTones.map((tone) => (
                  <ColorButton
                    key={tone.value}
                    color={tone.color}
                    selected={appearance.skinTone === tone.value}
                    onClick={() => updateAppearance('skinTone', tone.value)}
                    title={tone.label}
                  />
                ))}
              </div>
            </div>

            {/* 目の形 */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">目の形</h3>
              <div className="flex gap-2 flex-wrap">
                {eyeShapes.map((shape) => (
                  <SelectButton
                    key={shape.value}
                    selected={appearance.eyeShape === shape.value}
                    onClick={() => updateAppearance('eyeShape', shape.value)}
                  >
                    {shape.label}
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* 目の色 */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">目の色</h3>
              <div className="flex gap-3 flex-wrap">
                {eyeColors.map((color) => (
                  <ColorButton
                    key={color.value}
                    color={color.color}
                    selected={appearance.eyeColor === color.value}
                    onClick={() => updateAppearance('eyeColor', color.value)}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* 眉毛 */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">眉毛</h3>
              <div className="flex gap-2 flex-wrap">
                {eyebrowShapes.map((shape) => (
                  <SelectButton
                    key={shape.value}
                    selected={appearance.eyebrowShape === shape.value}
                    onClick={() => updateAppearance('eyebrowShape', shape.value)}
                  >
                    {shape.label}
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* 鼻 */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">鼻</h3>
              <div className="flex gap-2 flex-wrap">
                {noseShapes.map((shape) => (
                  <SelectButton
                    key={shape.value}
                    selected={appearance.noseShape === shape.value}
                    onClick={() => updateAppearance('noseShape', shape.value)}
                  >
                    {shape.label}
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* 口 */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">口</h3>
              <div className="flex gap-2 flex-wrap">
                {mouthShapes.map((shape) => (
                  <SelectButton
                    key={shape.value}
                    selected={appearance.mouthShape === shape.value}
                    onClick={() => updateAppearance('mouthShape', shape.value)}
                  >
                    {shape.label}
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* 耳 */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">耳の大きさ</h3>
              <div className="flex gap-2 flex-wrap">
                {earSizes.map((size) => (
                  <SelectButton
                    key={size.value}
                    selected={appearance.earSize === size.value}
                    onClick={() => updateAppearance('earSize', size.value)}
                  >
                    {size.label}
                  </SelectButton>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'hair' && (
          <>
            {/* 髪型 */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">髪型</h3>
              <div className="grid grid-cols-4 gap-2">
                {hairStyles.map((style) => (
                  <SelectButton
                    key={style.value}
                    selected={appearance.hairStyle === style.value}
                    onClick={() => updateAppearance('hairStyle', style.value)}
                  >
                    {style.label}
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* 髪色 */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">髪の色</h3>
              <div className="flex gap-3 flex-wrap">
                {hairColors.map((color) => (
                  <ColorButton
                    key={color.value}
                    color={color.color}
                    selected={appearance.hairColor === color.value}
                    onClick={() => updateAppearance('hairColor', color.value)}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'features' && (
          <>
            {/* 頬紅 */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">ほっぺの赤み</h3>
              <div className="flex gap-2 flex-wrap">
                {blushOptions.map((option) => (
                  <SelectButton
                    key={option.value}
                    selected={appearance.blush === option.value}
                    onClick={() => updateAppearance('blush', option.value)}
                  >
                    {option.label}
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* 顔の特徴 */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">顔の特徴</h3>
              <div className="flex gap-2 flex-wrap">
                {faceFeatures.map((feature) => (
                  <SelectButton
                    key={feature.value}
                    selected={appearance.faceFeature === feature.value}
                    onClick={() => updateAppearance('faceFeature', feature.value)}
                  >
                    {feature.label}
                  </SelectButton>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'clothes' && (
          <>
            {/* 帽子 */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">帽子</h3>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    setEquipped(prev => ({ ...prev, hat: undefined }));
                    unequipItem('hat');
                  }}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    !equipped.hat
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">❌</span>
                  <p className="text-xs text-gray-500 mt-1">なし</p>
                </button>
                {ownedHats.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setEquipped(prev => ({ ...prev, hat: item.id }));
                      equipItem(item.id, 'hat');
                    }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      equipped.hat === item.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-xs text-gray-500 mt-1">{item.name}</p>
                  </button>
                ))}
                {ownedHats.length === 0 && (
                  <p className="col-span-3 text-sm text-gray-400 py-2">
                    ショップで帽子を買おう！
                  </p>
                )}
              </div>
            </div>

            {/* 服 */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">服</h3>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    setEquipped(prev => ({ ...prev, top: undefined }));
                    unequipItem('top');
                  }}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    !equipped.top
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">👕</span>
                  <p className="text-xs text-gray-500 mt-1">基本</p>
                </button>
                {ownedTops.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setEquipped(prev => ({ ...prev, top: item.id }));
                      equipItem(item.id, 'top');
                    }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      equipped.top === item.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-xs text-gray-500 mt-1">{item.name}</p>
                  </button>
                ))}
                {ownedTops.length === 0 && (
                  <p className="col-span-3 text-sm text-gray-400 py-2">
                    ショップで服を買おう！
                  </p>
                )}
              </div>
            </div>

            {/* アクセサリー */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">アクセサリー</h3>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    setEquipped(prev => ({ ...prev, accessory: undefined }));
                    unequipItem('accessory');
                  }}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    !equipped.accessory
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">❌</span>
                  <p className="text-xs text-gray-500 mt-1">なし</p>
                </button>
                {ownedAccessories.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setEquipped(prev => ({ ...prev, accessory: item.id }));
                      equipItem(item.id, 'accessory');
                    }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      equipped.accessory === item.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-xs text-gray-500 mt-1">{item.name}</p>
                  </button>
                ))}
                {ownedAccessories.length === 0 && (
                  <p className="col-span-3 text-sm text-gray-400 py-2">
                    ショップでアクセサリーを買おう！
                  </p>
                )}
              </div>
            </div>

            {/* エフェクト */}
            <div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm">エフェクト</h3>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    setEquipped(prev => ({ ...prev, effect: undefined }));
                    unequipItem('effect');
                  }}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    !equipped.effect
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">❌</span>
                  <p className="text-xs text-gray-500 mt-1">なし</p>
                </button>
                {ownedEffects.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setEquipped(prev => ({ ...prev, effect: item.id }));
                      equipItem(item.id, 'effect');
                    }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      equipped.effect === item.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-xs text-gray-500 mt-1">{item.name}</p>
                  </button>
                ))}
                {ownedEffects.length === 0 && (
                  <p className="col-span-3 text-sm text-gray-400 py-2">
                    ショップでエフェクトを買おう！
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ヒント */}
      <div className="mt-4 bg-amber-50 rounded-xl p-4">
        <p className="text-sm text-amber-700">
          💡 🔒マークのアイテムはショップで星を使って買えるよ！
        </p>
      </div>
    </div>
  );
}
