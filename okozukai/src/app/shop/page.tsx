'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShopItem, ShopItemCategory } from '@/types';
import { useShop } from '@/hooks/useShop';
import { useStars } from '@/hooks/useStars';

type TabType = ShopItemCategory | 'all';

const tabs: { value: TabType; label: string; icon: string }[] = [
  { value: 'all', label: '全部', icon: '✨' },
  { value: 'hat', label: '帽子', icon: '🎩' },
  { value: 'top', label: '服', icon: '👕' },
  { value: 'accessory', label: 'アクセサリー', icon: '💎' },
  { value: 'effect', label: 'エフェクト', icon: '✨' },
];

const rarityStyles = {
  common: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
  },
  rare: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-600',
  },
  legendary: {
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    border: 'border-yellow-300',
    badge: 'bg-yellow-100 text-yellow-700',
  },
};

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const { filteredItems, isOwned, canPurchase, purchaseItem, loading: shopLoading } = useShop({
    category: activeTab === 'all' ? 'all' : activeTab,
  });
  const { totalStars, loading: starsLoading } = useStars();

  const loading = shopLoading || starsLoading;

  const handleBuy = (item: ShopItem) => {
    setSelectedItem(item);
    setPurchaseSuccess(false);
    setShowModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedItem) return;

    setIsPurchasing(true);
    try {
      const success = await purchaseItem(selectedItem);
      if (success) {
        setPurchaseSuccess(true);
      } else {
        alert('購入できませんでした');
        setShowModal(false);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('エラーが発生しました');
      setShowModal(false);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">ショップ</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">ショップ</h1>
        <Link
          href="/customize"
          className="px-4 py-2 bg-indigo-500 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-colors"
        >
          着せ替え →
        </Link>
      </div>

      {/* 所持星 */}
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm">持っている星</p>
            <p className="text-3xl font-bold text-white">⭐ {totalStars}</p>
          </div>
          <Link
            href="/tasks"
            className="px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-xl hover:bg-white/30 transition-colors"
          >
            星を集める
          </Link>
        </div>
      </div>

      {/* タブ */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              activeTab === tab.value
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* アイテム一覧 */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">アイテムがありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const owned = isOwned(item.id);
            const canAfford = canPurchase(item);
            const styles = rarityStyles[item.rarity];

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-2 ${styles.bg} ${styles.border} ${
                  owned ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-4xl">{item.icon}</span>
                  {item.rarity !== 'common' && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>
                      {item.rarity === 'rare' ? 'レア' : 'レジェンド'}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>

                <div className="flex items-center justify-between mt-3">
                  <span className={`font-bold ${canAfford || owned ? 'text-yellow-600' : 'text-red-500'}`}>
                    ⭐ {item.price}
                  </span>
                  {owned ? (
                    <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
                      持ってる
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`text-sm px-4 py-2 rounded-xl font-bold transition-colors ${
                        canAfford
                          ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      買う
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 購入モーダル */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            {!purchaseSuccess ? (
              <>
                <div className="text-center mb-4">
                  <span className="text-6xl">{selectedItem.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                  {selectedItem.name}
                </h3>
                <p className="text-gray-500 text-center text-sm mb-4">
                  {selectedItem.description}
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">価格</span>
                    <span className="font-bold text-yellow-600">⭐ {selectedItem.price}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">購入後</span>
                    <span className="font-bold text-gray-800">
                      ⭐ {totalStars - selectedItem.price}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={isPurchasing}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    やめる
                  </button>
                  <button
                    onClick={confirmPurchase}
                    disabled={isPurchasing}
                    className="flex-1 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50"
                  >
                    {isPurchasing ? '...' : '購入する'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <span className="text-6xl animate-bounce inline-block">{selectedItem.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                  🎉 ゲット！
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  {selectedItem.name}を手に入れた！
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    閉じる
                  </button>
                  <Link
                    href="/customize"
                    className="flex-1 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors text-center"
                  >
                    着せ替える
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
