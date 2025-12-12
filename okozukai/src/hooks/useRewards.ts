'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoSafe } from '@/contexts/DemoContext';
import { rewardService, rewardRedemptionService } from '@/lib/services/reward.service';
import { isFirestoreAvailable } from '@/lib/services';
import { Reward, RewardRedemption } from '@/types';

interface UseRewardsOptions {
  mode?: 'all' | 'active';
}

interface UseRewardsReturn {
  rewards: Reward[];
  loading: boolean;
  error: Error | null;
  createReward: (
    name: string,
    starsRequired: number,
    icon: string,
    description?: string
  ) => Promise<string>;
  updateReward: (id: string, updates: Partial<Reward>) => Promise<void>;
  deleteReward: (id: string) => Promise<void>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
  redeemReward: (reward: Reward) => Promise<string | boolean>;
  refresh: () => Promise<void>;
}

export function useRewards(options: UseRewardsOptions = {}): UseRewardsReturn {
  const { user, isConfigured } = useAuth();
  const demo = useDemoSafe();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { mode = 'active' } = options;

  // Determine if we should use demo mode
  const useDemo = !isConfigured || !isFirestoreAvailable() || !user?.familyId;

  // Load rewards
  useEffect(() => {
    if (useDemo && demo) {
      let demoRewards = demo.data.rewards;

      if (mode === 'active') {
        demoRewards = demoRewards.filter(r => r.isActive);
      }

      setRewards(demoRewards);
      setLoading(false);
      return;
    }

    if (!user?.familyId) {
      setRewards([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = mode === 'active'
      ? rewardService.subscribeToActive(user.familyId, (fetchedRewards) => {
          setRewards(fetchedRewards);
          setLoading(false);
        })
      : rewardService.subscribeToFamily(user.familyId, (fetchedRewards) => {
          setRewards(fetchedRewards);
          setLoading(false);
        });

    return () => unsubscribe();
  }, [useDemo, demo, user?.familyId, mode]);

  // Create reward (parent)
  const createReward = useCallback(async (
    name: string,
    starsRequired: number,
    icon: string,
    description?: string
  ): Promise<string> => {
    if (useDemo) {
      // Demo mode doesn't support creating rewards for now
      return `reward_${Date.now()}`;
    }

    if (!user?.familyId) {
      throw new Error('Not authenticated');
    }

    return rewardService.createReward(
      user.familyId,
      name,
      starsRequired,
      icon,
      description
    );
  }, [useDemo, user?.familyId]);

  // Update reward
  const updateReward = useCallback(async (
    id: string,
    updates: Partial<Reward>
  ): Promise<void> => {
    if (useDemo) {
      return;
    }

    await rewardService.update(id, updates);
  }, [useDemo]);

  // Delete reward
  const deleteReward = useCallback(async (id: string): Promise<void> => {
    if (useDemo) {
      return;
    }

    await rewardService.delete(id);
  }, [useDemo]);

  // Toggle active status
  const toggleActive = useCallback(async (
    id: string,
    isActive: boolean
  ): Promise<void> => {
    if (useDemo) {
      return;
    }

    await rewardService.toggleActive(id, isActive);
  }, [useDemo]);

  // Redeem reward (child)
  const redeemReward = useCallback(async (
    reward: Reward
  ): Promise<string | boolean> => {
    if (useDemo && demo) {
      return demo.redeemReward(reward.id);
    }

    if (!user?.familyId || !user?.id) {
      throw new Error('Not authenticated');
    }

    return rewardRedemptionService.redeemReward(
      user.id,
      user.familyId,
      reward
    );
  }, [useDemo, demo, user?.familyId, user?.id]);

  // Refresh
  const refresh = useCallback(async (): Promise<void> => {
    if (useDemo) return;
    if (!user?.familyId) return;

    setLoading(true);
    try {
      const fetchedRewards = mode === 'active'
        ? await rewardService.getActiveByFamily(user.familyId)
        : await rewardService.getByFamily(user.familyId);
      setRewards(fetchedRewards);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [useDemo, user?.familyId, mode]);

  return {
    rewards,
    loading,
    error,
    createReward,
    updateReward,
    deleteReward,
    toggleActive,
    redeemReward,
    refresh,
  };
}

// Hook for redemption history
interface UseRedemptionsOptions {
  childId?: string;
  mode?: 'all' | 'pending';
}

interface UseRedemptionsReturn {
  redemptions: RewardRedemption[];
  loading: boolean;
  error: Error | null;
  pendingCount: number;
  fulfillRedemption: (id: string) => Promise<void>;
}

export function useRedemptions(options: UseRedemptionsOptions = {}): UseRedemptionsReturn {
  const { user, isConfigured } = useAuth();
  const demo = useDemoSafe();
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { childId, mode = 'all' } = options;

  const useDemo = !isConfigured || !isFirestoreAvailable() || !user?.familyId;

  // Load redemptions
  useEffect(() => {
    if (useDemo) {
      // Demo mode doesn't track redemptions separately
      setRedemptions([]);
      setLoading(false);
      return;
    }

    if (!user?.familyId) {
      setRedemptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    let unsubscribe: () => void;

    if (mode === 'pending') {
      unsubscribe = rewardRedemptionService.subscribeToPending(
        user.familyId,
        (fetched) => {
          setRedemptions(fetched);
          setLoading(false);
        }
      );
    } else if (childId) {
      unsubscribe = rewardRedemptionService.subscribeToChild(
        childId,
        (fetched) => {
          setRedemptions(fetched);
          setLoading(false);
        }
      );
    } else {
      // Get all for family
      rewardRedemptionService.getByFamily(user.familyId)
        .then(fetched => {
          setRedemptions(fetched);
          setLoading(false);
        })
        .catch(err => {
          setError(err);
          setLoading(false);
        });
      return;
    }

    return () => unsubscribe?.();
  }, [useDemo, user?.familyId, childId, mode]);

  const pendingCount = useMemo(() => {
    return redemptions.filter(r => r.status === 'pending').length;
  }, [redemptions]);

  const fulfillRedemption = useCallback(async (id: string): Promise<void> => {
    if (useDemo) return;
    await rewardRedemptionService.fulfillRedemption(id);
  }, [useDemo]);

  return {
    redemptions,
    loading,
    error,
    pendingCount,
    fulfillRedemption,
  };
}
