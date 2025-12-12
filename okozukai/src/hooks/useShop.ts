'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoSafe } from '@/contexts/DemoContext';
import { shopItemService, playerDataService } from '@/lib/services/player.service';
import { isFirestoreAvailable } from '@/lib/services';
import { ShopItem, ShopItemCategory } from '@/types';
import { usePlayer } from './usePlayer';
import { useStars } from './useStars';

interface UseShopOptions {
  category?: ShopItemCategory | 'all';
}

interface UseShopReturn {
  items: ShopItem[];
  filteredItems: ShopItem[];
  loading: boolean;
  error: Error | null;
  canPurchase: (item: ShopItem) => boolean;
  isOwned: (itemId: string) => boolean;
  purchaseItem: (item: ShopItem) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useShop(options: UseShopOptions = {}): UseShopReturn {
  const { user, isConfigured } = useAuth();
  const demo = useDemoSafe();
  const { ownedItemIds } = usePlayer();
  const { totalStars } = useStars();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { category = 'all' } = options;

  // Determine if we should use demo mode
  const useDemo = !isConfigured || !isFirestoreAvailable() || !user?.familyId;

  // Load shop items
  useEffect(() => {
    if (useDemo && demo) {
      setItems(demo.data.shopItems);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = shopItemService.subscribeToAll((fetchedItems) => {
      setItems(fetchedItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [useDemo, demo]);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (category === 'all') return items;
    return items.filter(item => item.category === category);
  }, [items, category]);

  // Check if player can purchase item
  const canPurchase = useCallback((item: ShopItem): boolean => {
    if (ownedItemIds.includes(item.id)) return false;
    return totalStars >= item.price;
  }, [ownedItemIds, totalStars]);

  // Check if item is owned
  const isOwned = useCallback((itemId: string): boolean => {
    return ownedItemIds.includes(itemId);
  }, [ownedItemIds]);

  // Purchase item
  const purchaseItem = useCallback(async (item: ShopItem): Promise<boolean> => {
    if (!canPurchase(item)) return false;

    if (useDemo && demo) {
      return demo.purchaseItem(item.id);
    }

    if (!user?.id || !user?.familyId) {
      throw new Error('Not authenticated');
    }

    return playerDataService.purchaseItem(user.id, user.familyId, item);
  }, [useDemo, demo, user?.id, user?.familyId, canPurchase]);

  // Refresh
  const refresh = useCallback(async (): Promise<void> => {
    if (useDemo) return;

    setLoading(true);
    try {
      const fetchedItems = await shopItemService.getAllActive();
      setItems(fetchedItems);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [useDemo]);

  return {
    items,
    filteredItems,
    loading,
    error,
    canPurchase,
    isOwned,
    purchaseItem,
    refresh,
  };
}

// Get items by rarity
export function useShopByRarity(): {
  common: ShopItem[];
  rare: ShopItem[];
  legendary: ShopItem[];
  loading: boolean;
} {
  const { items, loading } = useShop();

  const byRarity = useMemo(() => ({
    common: items.filter(i => i.rarity === 'common'),
    rare: items.filter(i => i.rarity === 'rare'),
    legendary: items.filter(i => i.rarity === 'legendary'),
  }), [items]);

  return {
    ...byRarity,
    loading,
  };
}
