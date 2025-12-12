'use client';

import { useState } from 'react';
import { encouragementMessages } from '@/lib/valueLessons';
import { useSubmissions } from '@/hooks/useSubmissions';

export default function ApprovePage() {
  const { submissions, loading, approveSubmission, rejectSubmission } = useSubmissions({ mode: 'pending' });
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showMessageInput, setShowMessageInput] = useState<string | null>(null);
  const [parentMessage, setParentMessage] = useState('');

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}時間前`;
    if (minutes > 0) return `${minutes}分前`;
    return 'たった今';
  };

  const getRandomEncouragement = () => {
    return encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
  };

  const handleApprove = async (id: string) => {
    if (showMessageInput === id) {
      // Submit with message
      setProcessingId(id);
      try {
        await approveSubmission(id, parentMessage || undefined);
      } catch (error) {
        console.error('Failed to approve submission:', error);
      }
      setProcessingId(null);
      setShowMessageInput(null);
      setParentMessage('');
    } else {
      // Show message input
      setShowMessageInput(id);
      setParentMessage(getRandomEncouragement());
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('やりなおしの理由を教えてください（空欄でもOK）');
    if (reason === null) return;

    setProcessingId(id);
    try {
      await rejectSubmission(id, reason || '');
    } catch (error) {
      console.error('Failed to reject submission:', error);
    }
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-2">承認待ち</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-2">承認待ち</h1>
      <p className="text-gray-600 text-sm mb-6">
        お子さんの報告を確認して、励ましの言葉を送りましょう
      </p>

      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-gray-600">
            承認待ちのお手伝いはありません
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white rounded-2xl shadow p-4"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{submission.task?.icon || '⭐'}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">
                      お子さん
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(submission.submittedAt)}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-800 mt-1">
                    {submission.task?.name || 'タスク'}
                  </h3>

                  {/* 子どものふりかえり */}
                  {submission.reflection && (
                    <div className="mt-2 bg-blue-50 p-3 rounded-xl">
                      <p className="text-xs text-blue-600 mb-1">💭 ふりかえり</p>
                      <p className="text-sm text-blue-800">
                        {submission.reflection}
                      </p>
                    </div>
                  )}

                  {submission.note && !submission.reflection && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                      💬 {submission.note}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex">
                      {[...Array(submission.stars)].map((_, i) => (
                        <span key={i} className="text-lg">⭐</span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {submission.stars}ほし
                    </span>
                  </div>
                </div>
              </div>

              {/* 親のメッセージ入力 */}
              {showMessageInput === submission.id && (
                <div className="mt-4 bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-700 mb-2">
                    ✨ お子さんに励ましの言葉を送りましょう
                  </p>
                  <textarea
                    value={parentMessage}
                    onChange={(e) => setParentMessage(e.target.value)}
                    placeholder="よくがんばったね！"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none text-sm"
                  />
                  <p className="text-xs text-green-600 mt-1">
                    💡 具体的に褒めると、やる気につながります
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleApprove(submission.id)}
                  disabled={processingId === submission.id}
                  className="flex-1 py-3 px-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {showMessageInput === submission.id ? (
                    '⭐ ほしをあげる'
                  ) : (
                    '✅ しょうにん'
                  )}
                </button>
                {showMessageInput !== submission.id && (
                  <button
                    onClick={() => handleReject(submission.id)}
                    disabled={processingId === submission.id}
                    className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    もういちど
                  </button>
                )}
                {showMessageInput === submission.id && (
                  <button
                    onClick={() => {
                      setShowMessageInput(null);
                      setParentMessage('');
                    }}
                    className="py-3 px-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    キャンセル
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
