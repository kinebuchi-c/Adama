'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoSafe } from '@/contexts/DemoContext';
import { taskTemplateService } from '@/lib/services/task.service';
import { isFirestoreAvailable } from '@/lib/services';
import { TaskTemplate, TaskCategory } from '@/types';

interface UseTasksOptions {
  category?: TaskCategory | 'all';
}

interface UseTasksReturn {
  tasks: TaskTemplate[];
  loading: boolean;
  error: Error | null;
  filteredTasks: TaskTemplate[];
  addTask: (task: Omit<TaskTemplate, 'id' | 'createdAt'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<TaskTemplate>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { user, isConfigured } = useAuth();
  const demo = useDemoSafe();
  const [tasks, setTasks] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { category = 'all' } = options;

  // Determine if we should use demo mode
  const useDemo = !isConfigured || !isFirestoreAvailable() || !user?.familyId;

  // Load tasks
  useEffect(() => {
    if (useDemo && demo) {
      setTasks(demo.data.tasks);
      setLoading(false);
      return;
    }

    if (!user?.familyId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = taskTemplateService.subscribeToFamily(
      user.familyId,
      (fetchedTasks) => {
        setTasks(fetchedTasks);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [useDemo, demo, user?.familyId]);

  // Filter tasks by category
  const filteredTasks = useMemo(() => {
    if (category === 'all') return tasks;
    return tasks.filter(task => task.category === category);
  }, [tasks, category]);

  // Add task
  const addTask = useCallback(async (task: Omit<TaskTemplate, 'id' | 'createdAt'>): Promise<string> => {
    if (useDemo && demo) {
      return demo.addTask(task);
    }

    if (!user?.familyId) throw new Error('Not authenticated');

    const id = await taskTemplateService.create({
      ...task,
      familyId: user.familyId,
      createdAt: new Date(),
    } as Omit<TaskTemplate, 'id'>);

    return id;
  }, [useDemo, demo, user?.familyId]);

  // Update task
  const updateTask = useCallback(async (id: string, updates: Partial<TaskTemplate>): Promise<void> => {
    if (useDemo && demo) {
      demo.updateTask(id, updates);
      return;
    }

    await taskTemplateService.update(id, updates);
  }, [useDemo, demo]);

  // Delete task
  const deleteTask = useCallback(async (id: string): Promise<void> => {
    if (useDemo && demo) {
      demo.deleteTask(id);
      return;
    }

    await taskTemplateService.delete(id);
  }, [useDemo, demo]);

  // Refresh (for non-realtime use cases)
  const refresh = useCallback(async (): Promise<void> => {
    if (useDemo) return;
    if (!user?.familyId) return;

    setLoading(true);
    try {
      const fetchedTasks = await taskTemplateService.getByFamily(user.familyId);
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [useDemo, user?.familyId]);

  return {
    tasks,
    loading,
    error,
    filteredTasks,
    addTask,
    updateTask,
    deleteTask,
    refresh,
  };
}

// Get a single task by ID
export function useTask(taskId: string | null): {
  task: TaskTemplate | null;
  loading: boolean;
} {
  const { tasks, loading } = useTasks();

  const task = useMemo(() => {
    if (!taskId) return null;
    return tasks.find(t => t.id === taskId) || null;
  }, [tasks, taskId]);

  return { task, loading };
}
