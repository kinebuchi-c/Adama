'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProposals } from '@/hooks/useProposals';
import { TaskProposal } from '@/types';

const categoryIcons: Record<string, string> = {
  chore: '🧹',
  study: '📚',
  kindness: '💕',
  other: '⭐',
};

const categoryLabels: Record<string, string> = {
  chore: 'おてつだい',
  study: 'べんきょう',
  kindness: 'おもいやり',
  other: 'そのほか',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: '確認待ち', color: 'bg-amber-100 text-amber-700' },
  discussion: { label: '話し合い中', color: 'bg-blue-100 text-blue-700' },
  approved: { label: '承認済み', color: 'bg-green-100 text-green-700' },
  rejected: { label: '見送り', color: 'bg-gray-100 text-gray-700' },
};

export default function ProposalsSettingsPage() {
  const { proposals, loading, approveProposal, rejectProposal, addComment } = useProposals({ mode: 'all' });
  const [selectedProposal, setSelectedProposal] = useState<TaskProposal | null>(null);
  const [agreedStars, setAgreedStars] = useState(1);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingProposals = proposals.filter(p => p.status === 'pending' || p.status === 'discussion');
  const processedProposals = proposals.filter(p => p.status === 'approved' || p.status === 'rejected');

  const handleApprove = async () => {
    if (!selectedProposal) return;
    setIsSubmitting(true);
    try {
      await approveProposal(selectedProposal.id, agreedStars, comment || undefined);
      setSelectedProposal(null);
      setComment('');
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProposal || !comment.trim()) return;
    setIsSubmitting(true);
    try {
      await rejectProposal(selectedProposal.id, comment);
      setSelectedProposal(null);
      setComment('');
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComment = async () => {
    if (!selectedProposal || !comment.trim()) return;
    setIsSubmitting(true);
    try {
      await addComment(selectedProposal.id, comment, agreedStars);
      setSelectedProposal(null);
      setComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded-2xl"></div>
          <div className="h-24 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/settings" className="text-gray-500 hover:text-gray-700">
          ← 戻る
        </Link>
        <h1 className="text-xl font-bold text-gray-800">提案の確認</h1>
      </div>

      {/* Pending proposals */}
      <section className="mb-8">
        <h2 className="font-bold text-lg text-gray-800 mb-4">
          確認が必要な提案 ({pendingProposals.length})
        </h2>
        {pendingProposals.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-500">
            確認待ちの提案はありません
          </div>
        ) : (
          <div className="space-y-3">
            {pendingProposals.map((proposal) => (
              <button
                key={proposal.id}
                onClick={() => {
                  setSelectedProposal(proposal);
                  setAgreedStars(proposal.suggestedStars);
                  setComment('');
                }}
                className="w-full bg-white rounded-2xl p-4 shadow hover:shadow-lg transition-shadow text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{categoryIcons[proposal.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 truncate">{proposal.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusLabels[proposal.status].color}`}>
                        {statusLabels[proposal.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{proposal.reason}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-amber-600 font-bold">
                        提案: {proposal.suggestedStars}ほし
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500">
                        {categoryLabels[proposal.category]}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Processed proposals */}
      {processedProposals.length > 0 && (
        <section>
          <h2 className="font-bold text-lg text-gray-800 mb-4">
            処理済み ({processedProposals.length})
          </h2>
          <div className="space-y-3">
            {processedProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-white rounded-2xl p-4 shadow opacity-75"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{categoryIcons[proposal.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 truncate">{proposal.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusLabels[proposal.status].color}`}>
                        {statusLabels[proposal.status].label}
                      </span>
                    </div>
                    {proposal.parentComment && (
                      <p className="text-sm text-gray-600">
                        コメント: {proposal.parentComment}
                      </p>
                    )}
                    {proposal.agreedStars && (
                      <p className="text-sm text-amber-600 font-bold">
                        決定: {proposal.agreedStars}ほし
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal for reviewing proposal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{categoryIcons[selectedProposal.category]}</span>
              <div>
                <h3 className="font-bold text-lg text-gray-800">{selectedProposal.name}</h3>
                <p className="text-sm text-gray-500">{categoryLabels[selectedProposal.category]}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">子どもの理由:</p>
              <p className="text-gray-600">{selectedProposal.reason}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                提案: {selectedProposal.suggestedStars}ほし → 決定するほし数:
              </p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setAgreedStars(stars)}
                    className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                      agreedStars === stars
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {stars}ほし
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                コメント（任意）
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="子どもへのメッセージを書いてね"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedProposal(null)}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              {selectedProposal.status === 'pending' && (
                <button
                  onClick={handleComment}
                  disabled={isSubmitting || !comment.trim()}
                  className="py-3 px-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  話し合う
                </button>
              )}
              <button
                onClick={handleReject}
                disabled={isSubmitting || !comment.trim()}
                className="py-3 px-4 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                見送り
              </button>
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                承認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
