'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoSafe } from '@/contexts/DemoContext';
import { taskProposalService } from '@/lib/services/proposal.service';
import { isFirestoreAvailable } from '@/lib/services';
import { TaskProposal, TaskCategory, ProposalStatus } from '@/types';

interface UseProposalsOptions {
  mode?: 'all' | 'pending' | 'child';
  childId?: string;
}

interface UseProposalsReturn {
  proposals: TaskProposal[];
  loading: boolean;
  error: Error | null;
  pendingCount: number;
  createProposal: (
    name: string,
    category: TaskCategory,
    suggestedStars: number,
    reason: string,
    description?: string
  ) => Promise<string>;
  approveProposal: (id: string, agreedStars: number, comment?: string) => Promise<void>;
  rejectProposal: (id: string, reason: string) => Promise<void>;
  addComment: (id: string, comment: string, agreedStars?: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useProposals(options: UseProposalsOptions = {}): UseProposalsReturn {
  const { user, isConfigured } = useAuth();
  const demo = useDemoSafe();
  const [proposals, setProposals] = useState<TaskProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { mode = 'all', childId } = options;

  // Determine if we should use demo mode
  const useDemo = !isConfigured || !isFirestoreAvailable() || !user?.familyId;

  // Load proposals
  useEffect(() => {
    if (useDemo && demo) {
      let demoProposals = demo.data.proposals;

      // Filter based on mode
      if (mode === 'pending') {
        demoProposals = demoProposals.filter(
          p => p.status === 'pending' || p.status === 'discussion'
        );
      } else if (mode === 'child' && childId) {
        demoProposals = demoProposals.filter(p => p.childId === childId);
      }

      setProposals(demoProposals);
      setLoading(false);
      return;
    }

    if (!user?.familyId) {
      setProposals([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    let unsubscribe: () => void;

    if (mode === 'pending') {
      unsubscribe = taskProposalService.subscribeToPending(
        user.familyId,
        (fetchedProposals) => {
          setProposals(fetchedProposals);
          setLoading(false);
        }
      );
    } else if (mode === 'child') {
      const targetChildId = childId || user.id;
      unsubscribe = taskProposalService.subscribeToChild(
        targetChildId,
        (fetchedProposals) => {
          setProposals(fetchedProposals);
          setLoading(false);
        }
      );
    } else {
      unsubscribe = taskProposalService.subscribeToFamily(
        user.familyId,
        (fetchedProposals) => {
          setProposals(fetchedProposals);
          setLoading(false);
        }
      );
    }

    return () => unsubscribe?.();
  }, [useDemo, demo, user?.familyId, user?.id, mode, childId]);

  // Pending count
  const pendingCount = useMemo(() => {
    return proposals.filter(
      p => p.status === 'pending' || p.status === 'discussion'
    ).length;
  }, [proposals]);

  // Create proposal (child)
  const createProposal = useCallback(async (
    name: string,
    category: TaskCategory,
    suggestedStars: number,
    reason: string,
    description?: string
  ): Promise<string> => {
    if (useDemo && demo) {
      return demo.createProposal({
        familyId: 'demo',
        childId: 'child1',
        name,
        description,
        category,
        suggestedStars,
        reason,
      });
    }

    if (!user?.familyId || !user?.id) {
      throw new Error('Not authenticated');
    }

    return taskProposalService.createProposal(
      user.id,
      user.familyId,
      name,
      category,
      suggestedStars,
      reason,
      description
    );
  }, [useDemo, demo, user?.familyId, user?.id]);

  // Approve proposal (parent)
  const approveProposal = useCallback(async (
    id: string,
    agreedStars: number,
    comment?: string
  ): Promise<void> => {
    if (useDemo && demo) {
      demo.updateProposal(id, {
        status: 'approved' as ProposalStatus,
        agreedStars,
        parentComment: comment,
        discussedAt: new Date(),
      });
      return;
    }

    await taskProposalService.approve(id, agreedStars, comment);
  }, [useDemo, demo]);

  // Reject proposal (parent)
  const rejectProposal = useCallback(async (
    id: string,
    reason: string
  ): Promise<void> => {
    if (useDemo && demo) {
      demo.updateProposal(id, {
        status: 'rejected' as ProposalStatus,
        parentComment: reason,
        discussedAt: new Date(),
      });
      return;
    }

    await taskProposalService.reject(id, reason);
  }, [useDemo, demo]);

  // Add comment (parent)
  const addComment = useCallback(async (
    id: string,
    comment: string,
    agreedStars?: number
  ): Promise<void> => {
    if (useDemo && demo) {
      demo.updateProposal(id, {
        status: 'discussion' as ProposalStatus,
        parentComment: comment,
        agreedStars,
        discussedAt: new Date(),
      });
      return;
    }

    await taskProposalService.addComment(id, comment, agreedStars);
  }, [useDemo, demo]);

  // Refresh
  const refresh = useCallback(async (): Promise<void> => {
    if (useDemo) return;
    if (!user?.familyId) return;

    setLoading(true);
    try {
      const fetchedProposals = await taskProposalService.getByFamily(user.familyId);
      setProposals(fetchedProposals);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [useDemo, user?.familyId]);

  return {
    proposals,
    loading,
    error,
    pendingCount,
    createProposal,
    approveProposal,
    rejectProposal,
    addComment,
    refresh,
  };
}
