'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoSafe } from '@/contexts/DemoContext';
import { taskSubmissionService } from '@/lib/services/task.service';
import { isFirestoreAvailable } from '@/lib/services';
import { TaskSubmission, TaskTemplate } from '@/types';
import { useTasks } from './useTasks';

interface UseSubmissionsOptions {
  mode?: 'pending' | 'child' | 'all';
  childId?: string;
}

interface SubmissionWithTask extends TaskSubmission {
  task?: TaskTemplate;
}

interface UseSubmissionsReturn {
  submissions: SubmissionWithTask[];
  loading: boolean;
  error: Error | null;
  createSubmission: (taskId: string, reflection?: string) => Promise<string>;
  approveSubmission: (id: string, parentMessage?: string) => Promise<void>;
  rejectSubmission: (id: string, reason: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSubmissions(options: UseSubmissionsOptions = {}): UseSubmissionsReturn {
  const { user, isConfigured } = useAuth();
  const demo = useDemoSafe();
  const { tasks } = useTasks();
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { mode = 'pending', childId } = options;

  // Determine if we should use demo mode
  const useDemo = !isConfigured || !isFirestoreAvailable() || !user?.familyId;

  // Load submissions
  useEffect(() => {
    if (useDemo && demo) {
      let demoSubmissions = demo.data.submissions;

      // Filter based on mode
      if (mode === 'pending') {
        demoSubmissions = demoSubmissions.filter(s => s.status === 'submitted');
      } else if (mode === 'child' && childId) {
        demoSubmissions = demoSubmissions.filter(s => s.childId === childId);
      }

      setSubmissions(demoSubmissions);
      setLoading(false);
      return;
    }

    if (!user?.familyId) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    let unsubscribe: () => void;

    if (mode === 'pending') {
      unsubscribe = taskSubmissionService.subscribeToPending(
        user.familyId,
        (fetchedSubmissions) => {
          setSubmissions(fetchedSubmissions);
          setLoading(false);
        }
      );
    } else if (mode === 'child') {
      const targetChildId = childId || user.id;
      unsubscribe = taskSubmissionService.subscribeToChild(
        targetChildId,
        (fetchedSubmissions) => {
          setSubmissions(fetchedSubmissions);
          setLoading(false);
        }
      );
    } else {
      // For 'all' mode, we'd need a different query
      // For now, just get pending for family
      unsubscribe = taskSubmissionService.subscribeToPending(
        user.familyId,
        (fetchedSubmissions) => {
          setSubmissions(fetchedSubmissions);
          setLoading(false);
        }
      );
    }

    return () => unsubscribe?.();
  }, [useDemo, demo, user?.familyId, user?.id, mode, childId]);

  // Enrich submissions with task data
  const submissionsWithTasks: SubmissionWithTask[] = useMemo(() => {
    return submissions.map(submission => ({
      ...submission,
      task: tasks.find(t => t.id === submission.taskTemplateId),
    }));
  }, [submissions, tasks]);

  // Create submission (child submits task completion)
  const createSubmission = useCallback(async (taskId: string, reflection?: string): Promise<string> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    if (useDemo && demo) {
      return demo.createSubmission(taskId, reflection);
    }

    if (!user?.familyId || !user?.id) throw new Error('Not authenticated');

    const id = await taskSubmissionService.createSubmission(
      taskId,
      user.id,
      user.familyId,
      task.stars,
      reflection
    );

    return id;
  }, [useDemo, demo, user?.familyId, user?.id, tasks]);

  // Approve submission (parent approves)
  const approveSubmission = useCallback(async (id: string, parentMessage?: string): Promise<void> => {
    const submission = submissions.find(s => s.id === id);
    if (!submission) throw new Error('Submission not found');

    const task = tasks.find(t => t.id === submission.taskTemplateId);

    if (useDemo && demo) {
      demo.approveSubmission(id, parentMessage);
      return;
    }

    if (!user?.familyId || !user?.id) throw new Error('Not authenticated');

    // Use transaction to approve and add stars atomically
    await taskSubmissionService.approveWithStars(
      id,
      submission.childId,
      user.familyId,
      submission.stars,
      task?.name || 'タスク',
      parentMessage,
      user.id
    );
  }, [useDemo, demo, user?.familyId, user?.id, submissions, tasks]);

  // Reject submission
  const rejectSubmission = useCallback(async (id: string, reason: string): Promise<void> => {
    if (useDemo && demo) {
      demo.rejectSubmission(id, reason);
      return;
    }

    if (!user?.id) throw new Error('Not authenticated');

    await taskSubmissionService.reject(id, reason, user.id);
  }, [useDemo, demo, user?.id]);

  // Refresh
  const refresh = useCallback(async (): Promise<void> => {
    if (useDemo) return;
    if (!user?.familyId) return;

    setLoading(true);
    try {
      const fetchedSubmissions = await taskSubmissionService.getPendingByFamily(user.familyId);
      setSubmissions(fetchedSubmissions);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [useDemo, user?.familyId]);

  return {
    submissions: submissionsWithTasks,
    loading,
    error,
    createSubmission,
    approveSubmission,
    rejectSubmission,
    refresh,
  };
}

// Get pending count for parent badge
export function usePendingCount(): number {
  const { submissions, loading } = useSubmissions({ mode: 'pending' });

  if (loading) return 0;
  return submissions.length;
}
