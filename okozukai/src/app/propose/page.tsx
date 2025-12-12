'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CharacterAvatar from '@/components/characters/CharacterAvatar';
import { useProposals } from '@/hooks/useProposals';
import { TaskCategory } from '@/types';

const categoryOptions: { value: TaskCategory; label: string; icon: string; description: string }[] = [
  { value: 'chore', label: 'おてつだい', icon: '🧹', description: 'おうちのしごと' },
  { value: 'study', label: 'べんきょう', icon: '📚', description: 'がくしゅう・しゅくだい' },
  { value: 'kindness', label: 'おもいやり', icon: '💕', description: 'やさしいこと' },
  { value: 'other', label: 'そのほか', icon: '⭐', description: 'ほかのがんばり' },
];

const rewardSuggestions = [10, 20, 30, 50];

export default function ProposePage() {
  const router = useRouter();
  const { createProposal } = useProposals({ mode: 'child' });
  const [step, setStep] = useState<'category' | 'details' | 'reason' | 'confirm'>('category');
  const [category, setCategory] = useState<TaskCategory | null>(null);
  const [name, setName] = useState('');
  const [suggestedReward, setSuggestedReward] = useState(20);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!category) return;

    setIsSubmitting(true);
    try {
      // Convert yen to stars (assuming 10 yen = 1 star)
      const suggestedStars = Math.ceil(suggestedReward / 10);

      await createProposal(
        name,
        category,
        suggestedStars,
        reason
      );

      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Failed to submit proposal:', error);
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <CharacterAvatar
          size="xl"
          expression="excited"
        />
        <h2 className="text-2xl font-bold text-gray-800 mt-6">ていあんできたよ！</h2>
        <p className="text-gray-600 mt-2 text-center">
          おやといっしょに<br />
          おはなししてみてね
        </p>
        <div className="mt-4 p-4 bg-amber-50 rounded-xl text-center">
          <p className="text-sm text-amber-700">
            💡 つぎの「かぞくかいぎ」で<br />
            いっしょにきめよう！
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          おてつだいをていあんする
        </h1>
        <Link href="/" className="text-gray-500 text-sm hover:text-gray-700">
          やめる
        </Link>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 mb-6">
        {['category', 'details', 'reason', 'confirm'].map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full ${
              ['category', 'details', 'reason', 'confirm'].indexOf(step) >= i
                ? 'bg-amber-400'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {step === 'category' && (
        <div>
          <p className="text-gray-600 mb-4">
            どんなしゅるいのおてつだい？
          </p>
          <div className="space-y-3">
            {categoryOptions.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  setStep('details');
                }}
                className="w-full p-4 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{cat.label}</h3>
                    <p className="text-sm text-gray-500">{cat.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'details' && (
        <div>
          <button
            onClick={() => setStep('category')}
            className="text-gray-500 text-sm mb-4 hover:text-gray-700"
          >
            ← もどる
          </button>

          <p className="text-gray-600 mb-4">
            どんなおてつだいをしたい？
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                おてつだいのなまえ
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="れい：げんかんのそうじ"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                いくらくらいがいいとおもう？
              </label>
              <div className="flex gap-2 flex-wrap">
                {rewardSuggestions.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setSuggestedReward(amount)}
                    className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                      suggestedReward === amount
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {amount}円
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ※ さいごはおやといっしょにきめるよ
              </p>
            </div>
          </div>

          <button
            onClick={() => name.trim() && setStep('reason')}
            disabled={!name.trim()}
            className="w-full mt-6 py-3 px-6 bg-amber-500 text-white font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors"
          >
            つぎへ
          </button>
        </div>
      )}

      {step === 'reason' && (
        <div>
          <button
            onClick={() => setStep('details')}
            className="text-gray-500 text-sm mb-4 hover:text-gray-700"
          >
            ← もどる
          </button>

          <p className="text-gray-600 mb-4">
            どうしてこのおてつだいがいいとおもう？
          </p>

          <div className="bg-amber-50 p-4 rounded-xl mb-4">
            <p className="text-sm text-amber-700">
              💡 りゆうをかんがえることで、<br />
              おやにきもちがつたわりやすくなるよ！
            </p>
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="れい：おかあさんがいそがしそうだから、てつだいたいとおもった"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
          />

          <button
            onClick={() => reason.trim() && setStep('confirm')}
            disabled={!reason.trim()}
            className="w-full mt-6 py-3 px-6 bg-amber-500 text-white font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors"
          >
            つぎへ
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div>
          <button
            onClick={() => setStep('reason')}
            className="text-gray-500 text-sm mb-4 hover:text-gray-700"
          >
            ← もどる
          </button>

          <p className="text-gray-600 mb-4">
            これでいい？
          </p>

          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">
                {categoryOptions.find((c) => c.value === category)?.icon}
              </span>
              <div>
                <h3 className="font-bold text-lg text-gray-800">{name}</h3>
                <p className="text-sm text-gray-500">
                  {categoryOptions.find((c) => c.value === category)?.label}
                </p>
              </div>
              <span className="ml-auto text-xl font-bold text-amber-600">
                {suggestedReward}円
              </span>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-1">りゆう：</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm">
                {reason}
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all text-lg"
          >
            {isSubmitting ? 'おくっているよ...' : 'おやにていあんする！'}
          </button>
        </div>
      )}
    </div>
  );
}
