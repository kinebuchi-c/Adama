'use client';

import { TaskTemplate, TaskDifficulty, TaskCategory } from '@/types';

interface TaskCardProps {
  task: TaskTemplate;
  onSelect?: (task: TaskTemplate) => void;
  selected?: boolean;
  showStars?: boolean;
}

const difficultyColors: Record<TaskDifficulty, string> = {
  easy: 'bg-green-100 text-green-700 border-green-300',
  normal: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  hard: 'bg-red-100 text-red-700 border-red-300',
};

const difficultyLabels: Record<TaskDifficulty, string> = {
  easy: 'かんたん',
  normal: 'ふつう',
  hard: 'むずかしい',
};

const difficultyStars: Record<TaskDifficulty, number> = {
  easy: 1,
  normal: 2,
  hard: 3,
};

const categoryIcons: Record<TaskCategory, string> = {
  chore: '🧹',
  study: '📚',
  kindness: '💕',
  other: '✨',
};

const categoryLabels: Record<TaskCategory, string> = {
  chore: 'おてつだい',
  study: 'べんきょう',
  kindness: 'おもいやり',
  other: 'そのほか',
};

export default function TaskCard({
  task,
  onSelect,
  selected = false,
  showStars = true,
}: TaskCardProps) {
  const stars = task.stars || difficultyStars[task.difficulty];

  return (
    <button
      onClick={() => onSelect?.(task)}
      className={`
        w-full p-4 rounded-2xl border-2 transition-all duration-200
        ${
          selected
            ? 'border-yellow-400 bg-yellow-50 shadow-lg scale-105'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div className="text-3xl">{task.icon || categoryIcons[task.category]}</div>

        <div className="flex-1 text-left">
          {/* Task name */}
          <h3 className="font-bold text-lg text-gray-800">{task.name}</h3>

          {/* Category and difficulty badges */}
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {categoryLabels[task.category]}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${difficultyColors[task.difficulty]}`}
            >
              {difficultyLabels[task.difficulty]}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-500 mt-2">{task.description}</p>
          )}
        </div>

        {/* Stars */}
        {showStars && (
          <div className="text-right flex flex-col items-center">
            <div className="flex gap-0.5">
              {[...Array(stars)].map((_, i) => (
                <span key={i} className="text-xl">⭐</span>
              ))}
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {stars}ほし
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
