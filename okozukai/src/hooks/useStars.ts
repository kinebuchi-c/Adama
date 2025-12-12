'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoSafe } from '@/contexts/DemoContext';
import { starBalanceService, starTransactionService } from '@/lib/services/star.service';
import { isFirestoreAvailable } from '@/lib/services';
import { StarBalance, StarTransaction } from '@/types';

interface UseStarsOptions {
  childId?: string;
  transactionLimit?: number;
}

interface UseStarsReturn {
  balance: StarBalance | null;
  transactions: StarTransaction[];
  loading: boolean;
  error: Error | null;
  totalStars: number;
  lifetimeStars: number;
  addStars: (stars: number, description: string, taskSubmissionId?: string) => Promise<void>;
  redeemStars: (stars: number, description: string, rewardId?: string, shopItemId?: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useStars(options: UseStarsOptions = {}): UseStarsReturn {
  const { user, isConfigured } = useAuth();
  const demo = useDemoSafe();
  const [balance, setBalance] = useState<StarBalance | null>(null);
  const [transactions, setTransactions] = useState<StarTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { childId, transactionLimit = 50 } = options;

  // Determine target child ID
  const targetChildId = childId || user?.id;

  // Determine if we should use demo mode
  const useDemo = !isConfigured || !isFirestoreAvailable() || !user?.familyId;

  // Load balance and transactions
  useEffect(() => {
    if (useDemo && demo) {
      setBalance(demo.data.starBalance);
      setTransactions(demo.data.transactions);
      setLoading(false);
      return;
    }

    if (!targetChildId) {
      setBalance(null);
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to balance
    const unsubBalance = starBalanceService.subscribeToBalance(
      targetChildId,
      (fetchedBalance) => {
        setBalance(fetchedBalance);
      }
    );

    // Subscribe to transactions
    const unsubTx = starTransactionService.subscribeToChild(
      targetChildId,
      (fetchedTransactions) => {
        setTransactions(fetchedTransactions);
        setLoading(false);
      },
      transactionLimit
    );

    return () => {
      unsubBalance();
      unsubTx();
    };
  }, [useDemo, demo, targetChildId, transactionLimit]);

  // Computed values
  const totalStars = useMemo(() => balance?.totalStars || 0, [balance]);
  const lifetimeStars = useMemo(() => balance?.lifetimeStars || 0, [balance]);

  // Add stars
  const addStars = useCallback(async (
    stars: number,
    description: string,
    taskSubmissionId?: string
  ): Promise<void> => {
    if (useDemo && demo) {
      demo.addStars(stars, description);
      return;
    }

    if (!targetChildId || !user?.familyId) {
      throw new Error('Not authenticated');
    }

    await starBalanceService.addStars(
      targetChildId,
      user.familyId,
      stars,
      description,
      taskSubmissionId
    );
  }, [useDemo, demo, targetChildId, user?.familyId]);

  // Redeem stars
  const redeemStars = useCallback(async (
    stars: number,
    description: string,
    rewardId?: string,
    shopItemId?: string
  ): Promise<boolean> => {
    if (useDemo && demo) {
      return demo.redeemStars(stars, description);
    }

    if (!targetChildId || !user?.familyId) {
      throw new Error('Not authenticated');
    }

    return starBalanceService.redeemStars(
      targetChildId,
      user.familyId,
      stars,
      description,
      rewardId,
      shopItemId
    );
  }, [useDemo, demo, targetChildId, user?.familyId]);

  // Refresh
  const refresh = useCallback(async (): Promise<void> => {
    if (useDemo) return;
    if (!targetChildId) return;

    setLoading(true);
    try {
      const [fetchedBalance, fetchedTransactions] = await Promise.all([
        starBalanceService.getByChild(targetChildId),
        starTransactionService.getByChild(targetChildId, transactionLimit),
      ]);
      setBalance(fetchedBalance);
      setTransactions(fetchedTransactions);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [useDemo, targetChildId, transactionLimit]);

  return {
    balance,
    transactions,
    loading,
    error,
    totalStars,
    lifetimeStars,
    addStars,
    redeemStars,
    refresh,
  };
}

// Get weekly stats for reports
export function useWeeklyStats(childId?: string): {
  earnedThisWeek: number;
  tasksCompletedThisWeek: number;
  loading: boolean;
} {
  const { transactions, loading } = useStars({ childId, transactionLimit: 100 });

  const stats = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyTransactions = transactions.filter(
      tx => tx.createdAt >= oneWeekAgo && tx.type === 'earn'
    );

    return {
      earnedThisWeek: weeklyTransactions.reduce((sum, tx) => sum + tx.stars, 0),
      tasksCompletedThisWeek: weeklyTransactions.filter(tx => tx.taskSubmissionId).length,
    };
  }, [transactions]);

  return {
    ...stats,
    loading,
  };
}
