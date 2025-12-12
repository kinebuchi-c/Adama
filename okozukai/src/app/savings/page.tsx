'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoSafe } from '@/contexts/DemoContext';
import { useStars } from '@/hooks/useStars';
import StarJar from '@/components/stars/StarJar';
import { Reward } from '@/types';

export default function SavingsPage() {
  const { user } = useAuth();
  const demo = useDemoSafe();
  const { totalStars, transactions, loading, redeemStars } = useStars();
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const isParent = user?.role === 'parent';

  // Get rewards from demo context
  const rewards = demo?.data.rewards || [];

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今日';
    if (days === 1) return '昨日';
    if (days < 7) return `${days}日前`;

    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRedeem = (reward: Reward) => {
    if (totalStars >= reward.starsRequired) {
      setSelectedReward(reward);
      setShowRedeemModal(true);
    }
  };

  const confirmRedeem = async () => {
    if (!selectedReward) return;

    setIsRedeeming(true);
    try {
      const success = await redeemStars(
        selectedReward.starsRequired,
        `${selectedReward.name}と交換`,
        selectedReward.id
      );

      if (success) {
        alert(`🎉 ${selectedReward.name} をゲット！親に伝えてね`);
      } else {
        alert('星が足りないよ！');
      }
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      alert('エラーが発生しました');
    } finally {
      setIsRedeeming(false);
      setShowRedeemModal(false);
      setSelectedReward(null);
    }
  };

  const nextReward = rewards.find(r => r.starsRequired > totalStars) || rewards[0];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">
          {isParent ? '星の状況' : '星集め'}
        </h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        {isParent ? '星の状況' : '星集め'}
      </h1>

      <StarJar
        totalStars={totalStars}
        nextReward={nextReward}
      />

      {/* 親向け：金額換算表示 */}
      {isParent && (
        <div className="mt-4 bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">
            💰 金額換算（親のみ表示）：{totalStars}星 = 約{totalStars * 10}円相当
          </p>
        </div>
      )}

      {/* ごほうび一覧 */}
      <div className="mt-8">
        <h2 className="font-bold text-lg text-gray-800 mb-4">
          🎁 ごほうび
        </h2>
        {rewards.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            まだごほうびがありません
          </p>
        ) : (
          <div className="space-y-3">
            {rewards.map((reward) => {
              const canRedeem = totalStars >= reward.starsRequired;
              const progress = Math.min((totalStars / reward.starsRequired) * 100, 100);

              return (
                <button
                  key={reward.id}
                  onClick={() => canRedeem && handleRedeem(reward)}
                  disabled={!canRedeem}
                  className={`w-full p-4 rounded-2xl text-left transition-all ${
                    canRedeem
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 hover:shadow-lg'
                      : 'bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{reward.icon}</span>
                    <div className="flex-1">
                      <h3 className={`font-bold ${canRedeem ? 'text-gray-800' : 'text-gray-500'}`}>
                        {reward.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              canRedeem ? 'bg-yellow-400' : 'bg-gray-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {totalStars}/{reward.starsRequired}⭐
                        </span>
                      </div>
                    </div>
                    {canRedeem && (
                      <span className="text-yellow-500 font-bold text-sm">
                        GET!
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 記録 */}
      <div className="mt-8">
        <h2 className="font-bold text-lg text-gray-800 mb-4">
          📜 記録
        </h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            まだ記録がありません
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {tx.type === 'earn' ? '⭐' : '🎁'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{tx.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-bold ${
                    tx.type === 'earn' ? 'text-yellow-500' : 'text-purple-500'
                  }`}
                >
                  {tx.type === 'earn' ? '+' : '-'}
                  {tx.stars}⭐
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Redeem modal */}
      {showRedeemModal && selectedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="text-6xl mb-4">{selectedReward.icon}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {selectedReward.name}をゲット？
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedReward.starsRequired}星を使うよ
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRedeemModal(false)}
                disabled={isRedeeming}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                やめる
              </button>
              <button
                onClick={confirmRedeem}
                disabled={isRedeeming}
                className="flex-1 py-3 px-4 bg-yellow-400 text-yellow-900 font-bold rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {isRedeeming ? '...' : '🎉 ゲット！'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
