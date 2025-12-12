'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoSafe } from '@/contexts/DemoContext';
import { playerDataService } from '@/lib/services/player.service';
import { isFirestoreAvailable } from '@/lib/services';
import { PlayerData, AvatarAppearance } from '@/types';

interface UsePlayerOptions {
  childId?: string;
}

interface UsePlayerReturn {
  playerData: PlayerData | null;
  loading: boolean;
  error: Error | null;
  avatar: AvatarAppearance | null;
  equippedItems: PlayerData['equippedItems'];
  ownedItemIds: string[];
  updateAvatar: (appearance: Partial<AvatarAppearance>) => Promise<void>;
  equipItem: (itemId: string, slot: keyof PlayerData['equippedItems']) => Promise<void>;
  unequipItem: (slot: keyof PlayerData['equippedItems']) => Promise<void>;
  refresh: () => Promise<void>;
}

const defaultAvatar: AvatarAppearance = {
  hairStyle: 'short',
  hairColor: 'black',
  skinTone: 'light',
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

export function usePlayer(options: UsePlayerOptions = {}): UsePlayerReturn {
  const { user, isConfigured } = useAuth();
  const demo = useDemoSafe();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { childId } = options;
  const targetChildId = childId || user?.id;

  // Determine if we should use demo mode
  const useDemo = !isConfigured || !isFirestoreAvailable() || !user?.familyId;

  // Load player data
  useEffect(() => {
    if (useDemo && demo) {
      setPlayerData(demo.data.playerData);
      setLoading(false);
      return;
    }

    if (!targetChildId) {
      setPlayerData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = playerDataService.subscribeToPlayer(
      targetChildId,
      (data) => {
        setPlayerData(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [useDemo, demo, targetChildId]);

  // Update avatar
  const updateAvatar = useCallback(async (appearance: Partial<AvatarAppearance>): Promise<void> => {
    if (useDemo && demo) {
      demo.updateAvatar(appearance);
      return;
    }

    if (!targetChildId) throw new Error('Not authenticated');

    await playerDataService.updateAvatar(targetChildId, appearance);
  }, [useDemo, demo, targetChildId]);

  // Equip item
  const equipItem = useCallback(async (
    itemId: string,
    slot: keyof PlayerData['equippedItems']
  ): Promise<void> => {
    if (useDemo && demo) {
      demo.equipItem(itemId, slot);
      return;
    }

    if (!targetChildId) throw new Error('Not authenticated');

    await playerDataService.equipItem(targetChildId, itemId, slot);
  }, [useDemo, demo, targetChildId]);

  // Unequip item
  const unequipItem = useCallback(async (
    slot: keyof PlayerData['equippedItems']
  ): Promise<void> => {
    if (useDemo && demo) {
      demo.unequipItem(slot);
      return;
    }

    if (!targetChildId) throw new Error('Not authenticated');

    await playerDataService.unequipItem(targetChildId, slot);
  }, [useDemo, demo, targetChildId]);

  // Refresh
  const refresh = useCallback(async (): Promise<void> => {
    if (useDemo) return;
    if (!targetChildId) return;

    setLoading(true);
    try {
      const data = await playerDataService.getByChild(targetChildId);
      setPlayerData(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [useDemo, targetChildId]);

  return {
    playerData,
    loading,
    error,
    avatar: playerData?.avatar || defaultAvatar,
    equippedItems: playerData?.equippedItems || {},
    ownedItemIds: playerData?.ownedItemIds || [],
    updateAvatar,
    equipItem,
    unequipItem,
    refresh,
  };
}
