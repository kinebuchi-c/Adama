'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TaskCard from '@/components/tasks/TaskCard';
import CharacterAvatar from '@/components/characters/CharacterAvatar';
import { TaskTemplate, TaskCategory } from '@/types';
import { getRandomLesson } from '@/lib/valueLessons';
import { useTasks } from '@/hooks/useTasks';
import { useSubmissions } from '@/hooks/useSubmissions';

const categoryFilters: { value: TaskCategory | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: '全部', icon: '✨' },
  { value: 'chore', label: 'お手伝い', icon: '🧹' },
  { value: 'study', label: '勉強', icon: '📚' },
  { value: 'kindness', label: '思いやり', icon: '💕' },
  { value: 'other', label: 'その他', icon: '⭐' },
];

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<TaskTemplate | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reflection, setReflection] = useState('');
  const [step, setStep] = useState<'select' | 'reflect'>('select');
  const router = useRouter();

  // Use hooks for data
  const { filteredTasks, loading: tasksLoading } = useTasks({ category: categoryFilter });
  const { createSubmission } = useSubmissions({ mode: 'child' });

  const handleTaskSelect = (task: TaskTemplate) => {
    setSelectedTask(task);
  };

  const handleProceedToReflect = () => {
    if (selectedTask) {
      setStep('reflect');
    }
  };

  const handleSubmit = async () => {
    if (!selectedTask) return;

    setIsSubmitting(true);
    try {
      await createSubmission(selectedTask.id, reflection || undefined);
      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setSelectedTask(null);
        setReflection('');
        setStep('select');
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Failed to submit task:', error);
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    const lesson = selectedTask?.valueLesson || getRandomLesson(selectedTask?.category).forChild;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="relative">
          <CharacterAvatar
            size="xl"
            expression="excited"
          />
          <div className="absolute -top-4 -right-4 flex">
            {[...Array(selectedTask?.stars || 1)].map((_, i) => (
              <span key={i} className="text-3xl animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>
                ⭐
              </span>
            ))}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-6">すごい！やったね！</h2>
        <p className="text-gray-600 mt-2">親に連絡したよ</p>

        <div className="mt-4 p-4 bg-amber-50 rounded-xl max-w-sm">
          <p className="text-amber-800 text-center">
            ⭐ {selectedTask?.stars}星 ゲット！
          </p>
        </div>

        {lesson && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-xl max-w-sm">
            <p className="text-indigo-700 text-sm text-center">
              💭 {lesson}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (step === 'reflect' && selectedTask) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => setStep('select')}
          className="text-gray-500 text-sm mb-4 hover:text-gray-700"
        >
          ← もどる
        </button>

        <div className="text-center mb-6">
          <CharacterAvatar size="lg" expression="happy" />
          <h2 className="text-xl font-bold text-gray-800 mt-4">
            「{selectedTask.name}」をやったんだね！
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow mb-6">
          <p className="text-gray-700 mb-4">
            やってみて、どうだった？（書かなくてもOK）
          </p>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="例：お母さんが喜んでくれてうれしかった"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 感じたことを書くと、親に気持ちが伝わるよ
          </p>
        </div>

        {selectedTask.valueLesson && (
          <div className="bg-indigo-50 rounded-2xl p-4 mb-6">
            <p className="text-indigo-700 text-sm">
              💭 {selectedTask.valueLesson}
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-2xl shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
        >
          {isSubmitting ? (
            '送信中...'
          ) : (
            <span className="flex items-center justify-center gap-2">
              親に報告する
              <span className="flex">
                {[...Array(selectedTask.stars)].map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </span>
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">
          星を集めよう
        </h1>
        <Link
          href="/propose"
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          + 提案する
        </Link>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categoryFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setCategoryFilter(filter.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              categoryFilter === filter.value
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {tasksLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">読み込み中...</p>
        </div>
      )}

      {/* Task list */}
      {!tasksLoading && (
        <div className="space-y-3 mb-24">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">タスクがありません</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                selected={selectedTask?.id === task.id}
                onSelect={handleTaskSelect}
              />
            ))
          )}
        </div>
      )}

      {/* Submit button - fixed at bottom */}
      {selectedTask && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-amber-50 to-transparent">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleProceedToReflect}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-2xl shadow-lg text-lg hover:shadow-xl transition-shadow"
            >
              <span className="flex items-center justify-center gap-2">
                「{selectedTask.name}」やったよ！
                <span className="flex">
                  {[...Array(selectedTask.stars)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
