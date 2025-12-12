'use client';

import CharacterAvatar from '@/components/characters/CharacterAvatar';
import { useWeeklyReport } from '@/hooks/useWeeklyReport';

export default function ReportPage() {
  const { reportData, loading } = useWeeklyReport();

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('ja-JP', options)} - ${end.toLocaleDateString('ja-JP', options)}`;
  };

  if (loading || !reportData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-40 bg-gray-200 rounded-2xl"></div>
          <div className="h-40 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const maxDailyStars = Math.max(...reportData.dailyActivity.map((d) => d.stars), 1);

  // Convert stars to yen (10 yen per star)
  const totalYen = reportData.totalStarsEarned * 10;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-2">週間レポート</h1>
      <p className="text-gray-600 text-sm mb-6">
        {formatDateRange(reportData.weekStart, reportData.weekEnd)}
      </p>

      {/* Summary card */}
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg mb-6">
        <div className="flex items-center gap-4">
          <CharacterAvatar
            size="lg"
            expression="excited"
          />
          <div>
            <p className="text-white/80 text-sm">こんしゅうのがんばり</p>
            <p className="text-4xl font-bold">{totalYen}円</p>
            <p className="text-white/80 text-sm mt-1">
              {reportData.totalTasksCompleted}回のおてつだい（{reportData.totalStarsEarned}ほし）
            </p>
          </div>
        </div>
      </div>

      {/* Daily activity chart */}
      <div className="bg-white rounded-2xl p-6 shadow mb-6">
        <h2 className="font-bold text-lg text-gray-800 mb-4">
          毎日のかつどう
        </h2>
        <div className="flex items-end justify-between gap-2 h-32">
          {reportData.dailyActivity.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center">
                {day.stars > 0 && (
                  <span className="text-xs text-amber-600 font-bold mb-1">
                    {day.stars * 10}円
                  </span>
                )}
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    day.stars > 0
                      ? 'bg-gradient-to-t from-amber-400 to-amber-300'
                      : 'bg-gray-200'
                  }`}
                  style={{
                    height: `${Math.max((day.stars / maxDailyStars) * 80, day.stars > 0 ? 20 : 8)}px`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-600 mt-2">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow">
        <h2 className="font-bold text-lg text-gray-800 mb-4">
          カテゴリべつ
        </h2>
        {reportData.breakdown.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            こんしゅうはまだきろくがないよ
          </p>
        ) : (
          <div className="space-y-4">
            {reportData.breakdown.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-800">
                      {item.category}
                    </span>
                    <span className="text-amber-600 font-bold">
                      {item.stars * 10}円
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                      style={{
                        width: `${(item.stars / reportData.totalStarsEarned) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.count}回（{item.stars}ほし）
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Encouragement message */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm">
          <span>🎉</span>
          <span>
            {reportData.totalTasksCompleted >= 7
              ? 'すごい！まいにちがんばったね！'
              : reportData.totalTasksCompleted >= 5
              ? 'よくがんばったね！'
              : reportData.totalTasksCompleted >= 1
              ? 'がんばっているね！'
              : 'らいしゅうもがんばろう！'}
          </span>
        </div>
      </div>
    </div>
  );
}
