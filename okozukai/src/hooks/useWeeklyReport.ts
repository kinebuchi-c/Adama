'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoSafe } from '@/contexts/DemoContext';
import { starTransactionService } from '@/lib/services/star.service';
import { taskSubmissionService } from '@/lib/services/task.service';
import { isFirestoreAvailable } from '@/lib/services';
import { StarTransaction, TaskSubmission, TaskCategory } from '@/types';

interface CategoryBreakdown {
  category: string;
  icon: string;
  count: number;
  stars: number;
}

interface DailyActivity {
  day: string;
  date: Date;
  tasks: number;
  stars: number;
}

interface WeeklyReportData {
  weekStart: Date;
  weekEnd: Date;
  totalTasksCompleted: number;
  totalStarsEarned: number;
  breakdown: CategoryBreakdown[];
  dailyActivity: DailyActivity[];
}

interface UseWeeklyReportOptions {
  childId?: string;
}

interface UseWeeklyReportReturn {
  reportData: WeeklyReportData | null;
  loading: boolean;
  error: Error | null;
}

const categoryLabels: Record<TaskCategory, { label: string; icon: string }> = {
  chore: { label: 'おてつだい', icon: '🧹' },
  study: { label: 'べんきょう', icon: '📚' },
  kindness: { label: 'おもいやり', icon: '💕' },
  other: { label: 'そのほか', icon: '⭐' },
};

const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];

function getWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

function getDayOfWeek(date: Date): string {
  return dayLabels[date.getDay()];
}

export function useWeeklyReport(options: UseWeeklyReportOptions = {}): UseWeeklyReportReturn {
  const { user, isConfigured } = useAuth();
  const demo = useDemoSafe();
  const [transactions, setTransactions] = useState<StarTransaction[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { childId } = options;
  const targetChildId = childId || user?.id || 'child1';

  const useDemo = !isConfigured || !isFirestoreAvailable() || !user?.familyId;

  // Load data
  useEffect(() => {
    const { start, end } = getWeekRange();

    if (useDemo && demo) {
      // Filter demo transactions for the week
      const weekTransactions = demo.data.transactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate >= start && txDate <= end && tx.type === 'earn';
      });

      // Filter demo submissions for the week
      const weekSubmissions = demo.data.submissions.filter(sub => {
        const subDate = new Date(sub.submittedAt);
        return subDate >= start && subDate <= end && sub.status === 'approved';
      });

      setTransactions(weekTransactions);
      setSubmissions(weekSubmissions);
      setLoading(false);
      return;
    }

    if (!user?.familyId) {
      setTransactions([]);
      setSubmissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Load transactions and submissions
    Promise.all([
      starTransactionService.getByChildInRange(targetChildId, start, end),
      taskSubmissionService.getApprovedByChildInRange(targetChildId, start, end),
    ])
      .then(([fetchedTransactions, fetchedSubmissions]) => {
        setTransactions(fetchedTransactions.filter(tx => tx.type === 'earn'));
        setSubmissions(fetchedSubmissions);
        setLoading(false);
      })
      .catch(err => {
        setError(err as Error);
        setLoading(false);
      });
  }, [useDemo, demo, user?.familyId, targetChildId]);

  // Calculate report data
  const reportData = useMemo((): WeeklyReportData | null => {
    const { start, end } = getWeekRange();

    // Total stars earned this week
    const totalStarsEarned = transactions.reduce((sum, tx) => sum + tx.stars, 0);
    const totalTasksCompleted = submissions.length || transactions.length;

    // Category breakdown - using transactions since they have descriptions
    const categoryMap = new Map<string, { count: number; stars: number }>();

    // Initialize all categories
    for (const cat of Object.keys(categoryLabels) as TaskCategory[]) {
      categoryMap.set(cat, { count: 0, stars: 0 });
    }

    // Count transactions by inferring category from description
    // In real implementation, transactions would have taskSubmissionId linked to task with category
    transactions.forEach(tx => {
      // Simple heuristic: categorize based on description keywords
      let category: TaskCategory = 'other';
      const desc = tx.description.toLowerCase();

      if (desc.includes('洗') || desc.includes('掃除') || desc.includes('片付') || desc.includes('運') || desc.includes('たたむ')) {
        category = 'chore';
      } else if (desc.includes('宿題') || desc.includes('読') || desc.includes('勉強') || desc.includes('べんきょう')) {
        category = 'study';
      } else if (desc.includes('優し') || desc.includes('助け') || desc.includes('手伝')) {
        category = 'kindness';
      }

      const current = categoryMap.get(category)!;
      categoryMap.set(category, {
        count: current.count + 1,
        stars: current.stars + tx.stars,
      });
    });

    const breakdown: CategoryBreakdown[] = [];
    for (const [cat, data] of categoryMap) {
      if (data.count > 0) {
        const catInfo = categoryLabels[cat as TaskCategory];
        breakdown.push({
          category: catInfo.label,
          icon: catInfo.icon,
          count: data.count,
          stars: data.stars,
        });
      }
    }

    // Sort by stars earned
    breakdown.sort((a, b) => b.stars - a.stars);

    // Daily activity for the past 7 days
    const dailyActivity: DailyActivity[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate >= date && txDate < nextDate;
      });

      dailyActivity.push({
        day: getDayOfWeek(date),
        date,
        tasks: dayTransactions.length,
        stars: dayTransactions.reduce((sum, tx) => sum + tx.stars, 0),
      });
    }

    return {
      weekStart: start,
      weekEnd: end,
      totalTasksCompleted,
      totalStarsEarned,
      breakdown,
      dailyActivity,
    };
  }, [transactions, submissions]);

  return {
    reportData,
    loading,
    error,
  };
}
