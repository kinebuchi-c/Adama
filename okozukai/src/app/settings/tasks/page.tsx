'use client';

import { useState } from 'react';
import { TaskTemplate, TaskCategory, TaskDifficulty } from '@/types';

const initialTasks: TaskTemplate[] = [
  {
    id: '1',
    familyId: '1',
    name: 'しょっきをはこぶ',
    category: 'chore',
    difficulty: 'easy',
    stars: 1,
    icon: '🍽️',
    createdBy: '1',
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    familyId: '1',
    name: 'しょっきあらい',
    category: 'chore',
    difficulty: 'normal',
    stars: 2,
    icon: '🧽',
    createdBy: '1',
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    familyId: '1',
    name: 'おふろそうじ',
    category: 'chore',
    difficulty: 'hard',
    stars: 3,
    icon: '🛁',
    createdBy: '1',
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: '4',
    familyId: '1',
    name: 'テスト100てん',
    description: 'さんすう・こくごなど',
    category: 'study',
    difficulty: 'hard',
    stars: 3,
    icon: '💯',
    createdBy: '1',
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: '5',
    familyId: '1',
    name: 'いもうとにやさしくした',
    category: 'kindness',
    difficulty: 'easy',
    stars: 1,
    icon: '💕',
    createdBy: '1',
    isApproved: true,
    createdAt: new Date(),
  },
];

const categoryOptions: { value: TaskCategory; label: string; icon: string }[] = [
  { value: 'chore', label: 'おてつだい', icon: '🧹' },
  { value: 'study', label: 'べんきょう', icon: '📚' },
  { value: 'kindness', label: 'おもいやり', icon: '💕' },
  { value: 'other', label: 'そのほか', icon: '⭐' },
];

const difficultyOptions: { value: TaskDifficulty; label: string; color: string; stars: number }[] = [
  { value: 'easy', label: 'かんたん', color: 'bg-green-100 text-green-700', stars: 1 },
  { value: 'normal', label: 'ふつう', color: 'bg-yellow-100 text-yellow-700', stars: 2 },
  { value: 'hard', label: 'むずかしい', color: 'bg-red-100 text-red-700', stars: 3 },
];

const iconOptions = ['🍽️', '🧽', '🛁', '👕', '🧹', '🗑️', '💯', '📝', '📚', '⭐', '🎹', '⚽', '💕', '🤝'];

export default function TaskManagementPage() {
  const [tasks, setTasks] = useState<TaskTemplate[]>(initialTasks);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'chore' as TaskCategory,
    difficulty: 'easy' as TaskDifficulty,
    stars: 1,
    icon: '⭐',
  });

  const openAddModal = () => {
    setEditingTask(null);
    setFormData({
      name: '',
      description: '',
      category: 'chore',
      difficulty: 'easy',
      stars: 1,
      icon: '⭐',
    });
    setShowModal(true);
  };

  const openEditModal = (task: TaskTemplate) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      description: task.description || '',
      category: task.category,
      difficulty: task.difficulty,
      stars: task.stars,
      icon: task.icon || '⭐',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('名前を入力してください');
      return;
    }

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, ...formData }
            : t
        )
      );
    } else {
      const newTask: TaskTemplate = {
        id: Date.now().toString(),
        familyId: '1',
        ...formData,
        createdBy: '1',
        isApproved: true,
        createdAt: new Date(),
      };
      setTasks((prev) => [...prev, newTask]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('このお手伝いを削除しますか？')) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // 難易度が変わったら星の数も自動更新
  const handleDifficultyChange = (difficulty: TaskDifficulty) => {
    const stars = difficultyOptions.find(d => d.value === difficulty)?.stars || 1;
    setFormData({ ...formData, difficulty, stars });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">お手伝い管理</h1>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors"
        >
          + 追加
        </button>
      </div>

      {/* 説明 */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-700">
          💡 むずかしさに応じて、もらえる⭐の数がかわります。
          <br />
          <span className="text-xs text-blue-600">
            ※ 子どもには⭐、親には金額換算（1⭐=10円）で表示されます
          </span>
        </p>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-2xl p-4 shadow flex items-center gap-3"
          >
            <span className="text-3xl">{task.icon}</span>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{task.name}</h3>
              <div className="flex gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                  {categoryOptions.find((c) => c.value === task.category)?.icon}
                  {categoryOptions.find((c) => c.value === task.category)?.label}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    difficultyOptions.find((d) => d.value === task.difficulty)?.color
                  }`}
                >
                  {difficultyOptions.find((d) => d.value === task.difficulty)?.label}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                {[...Array(task.stars)].map((_, i) => (
                  <span key={i} className="text-lg">⭐</span>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({task.stars * 10}円相当)
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => openEditModal(task)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="p-2 text-gray-500 hover:text-red-500"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingTask ? 'お手伝いを編集' : 'お手伝いを追加'}
            </h2>

            <div className="space-y-4">
              {/* Icon selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アイコン
                </label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`text-2xl p-2 rounded-lg transition-colors ${
                        formData.icon === icon
                          ? 'bg-amber-100 ring-2 ring-amber-500'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名前
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="しょっきあらい"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明（任意）
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="さんすう・こくごなど"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, category: cat.value })
                      }
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                        formData.category === cat.value
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  むずかしさ（⭐の数）
                </label>
                <div className="flex gap-2">
                  {difficultyOptions.map((diff) => (
                    <button
                      key={diff.value}
                      type="button"
                      onClick={() => handleDifficultyChange(diff.value)}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                        formData.difficulty === diff.value
                          ? diff.color + ' ring-2 ring-offset-1 ring-gray-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div>{diff.label}</div>
                      <div className="text-xs mt-1">
                        {'⭐'.repeat(diff.stars)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stars (manually adjustable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ほしの数（手動で調整可能）
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    value={formData.stars}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stars: parseInt(e.target.value) || 1,
                      })
                    }
                    min={1}
                    max={5}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1 min-w-[80px]">
                    {[...Array(formData.stars)].map((_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  = {formData.stars * 10}円相当（親のみ表示）
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 px-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
