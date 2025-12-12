import { motion } from 'framer-motion'
import { useBaobabStore } from '../../stores/baobabStore'

export function BaobabTree() {
  const { growth, getCurrentLevel, getProgressToNextLevel, getPointsToNextLevel } = useBaobabStore()
  const currentLevel = getCurrentLevel()
  const progress = getProgressToNextLevel()
  const pointsToNext = getPointsToNextLevel()

  if (!growth || !currentLevel) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ color: '#9ca3af' }}>Loading...</div>
      </div>
    )
  }

  const level = growth.level

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px',
      background: 'linear-gradient(to bottom, #fffbeb, #ffedd5)',
      borderRadius: '16px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    }}>
      {/* バオバブSVG */}
      <motion.svg
        viewBox="0 0 200 220"
        style={{ width: '208px', height: '208px' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 背景の太陽 (レベル5以上) */}
        {level >= 5 && (
          <motion.circle
            cx="160"
            cy="40"
            r={12 + level}
            fill="#FFE4B5"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}

        {/* 草原 */}
        <ellipse cx="100" cy="200" rx="90" ry="20" fill="#90EE90" />
        <ellipse cx="100" cy="198" rx="85" ry="16" fill="#7CCD7C" />

        {/* 小さな花 (レベル3以上) */}
        {level >= 3 && (
          <>
            <circle cx="45" cy="195" r="4" fill="#FFB6C1" />
            <circle cx="155" cy="193" r="4" fill="#FFB6C1" />
            <circle cx="60" cy="198" r="3" fill="#FFC0CB" />
            <circle cx="140" cy="196" r="3" fill="#FFC0CB" />
          </>
        )}

        {/* レベル1: 種 */}
        {level === 1 && (
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <ellipse cx="100" cy="185" rx="12" ry="8" fill="#8B4513" />
            <ellipse cx="100" cy="183" rx="10" ry="6" fill="#A0522D" />
            {/* かわいい顔 */}
            <circle cx="96" cy="183" r="1.5" fill="#4A3728" />
            <circle cx="104" cy="183" r="1.5" fill="#4A3728" />
            <path d="M98,186 Q100,188 102,186" stroke="#4A3728" strokeWidth="1" fill="none" />
            {/* キラキラ */}
            <motion.text
              x="115"
              y="178"
              fontSize="12"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ✨
            </motion.text>
          </motion.g>
        )}

        {/* レベル2: 芽 */}
        {level === 2 && (
          <motion.g
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            {/* 茎 */}
            <rect x="97" y="170" width="6" height="20" rx="3" fill="#228B22" />
            {/* 双葉 */}
            <ellipse cx="90" cy="168" rx="10" ry="6" fill="#32CD32" transform="rotate(-30 90 168)" />
            <ellipse cx="110" cy="168" rx="10" ry="6" fill="#32CD32" transform="rotate(30 110 168)" />
            {/* かわいい顔 */}
            <circle cx="96" cy="175" r="1" fill="#155724" />
            <circle cx="104" cy="175" r="1" fill="#155724" />
            <path d="M98,178 Q100,180 102,178" stroke="#155724" strokeWidth="1" fill="none" />
          </motion.g>
        )}

        {/* レベル3以上: バオバブの木 */}
        {level >= 3 && (
          <motion.g
            initial={{ scale: 0.5, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            {/* バオバブ特有のぽっちゃり幹 */}
            <path
              d={`M100,190
                  C70,190 60,${175 - level * 3} 65,${150 - level * 5}
                  C68,${130 - level * 4} 80,${120 - level * 5} 100,${115 - level * 6}
                  C120,${120 - level * 5} 132,${130 - level * 4} 135,${150 - level * 5}
                  C140,${175 - level * 3} 130,190 100,190`}
              fill="#CD853F"
            />
            {/* 幹のハイライト */}
            <path
              d={`M95,185
                  C78,185 72,${170 - level * 3} 75,${155 - level * 5}
                  C77,${140 - level * 4} 85,${130 - level * 5} 95,${125 - level * 6}
                  C90,${135 - level * 5} 85,${150 - level * 4} 85,${165 - level * 3}
                  C85,175 88,185 95,185`}
              fill="#DEB887"
              opacity="0.5"
            />

            {/* 枝 */}
            {level >= 4 && (
              <>
                <path
                  d={`M80,${130 - level * 4} Q60,${110 - level * 3} 50,${100 - level * 3}`}
                  stroke="#CD853F"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={`M120,${130 - level * 4} Q140,${110 - level * 3} 150,${100 - level * 3}`}
                  stroke="#CD853F"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}

            {/* 葉っぱクラスター */}
            {level >= 3 && (
              <>
                {/* 中央の葉 */}
                <ellipse cx="100" cy={85 - level * 5} rx={20 + level * 2} ry={15 + level * 1.5} fill="#228B22" />
                <ellipse cx="100" cy={80 - level * 5} rx={18 + level * 2} ry={12 + level * 1.5} fill="#32CD32" />
              </>
            )}

            {level >= 5 && (
              <>
                {/* 左の葉 */}
                <ellipse cx={55 - level} cy={90 - level * 3} rx={15 + level} ry={12 + level * 0.8} fill="#228B22" />
                <ellipse cx={55 - level} cy={87 - level * 3} rx={13 + level} ry={10 + level * 0.8} fill="#32CD32" />
                {/* 右の葉 */}
                <ellipse cx={145 + level} cy={90 - level * 3} rx={15 + level} ry={12 + level * 0.8} fill="#228B22" />
                <ellipse cx={145 + level} cy={87 - level * 3} rx={13 + level} ry={10 + level * 0.8} fill="#32CD32" />
              </>
            )}

            {level >= 7 && (
              <>
                {/* 追加の葉 */}
                <ellipse cx={70} cy={65 - level * 3} rx={12 + level * 0.5} ry={10} fill="#228B22" />
                <ellipse cx={130} cy={65 - level * 3} rx={12 + level * 0.5} ry={10} fill="#228B22" />
              </>
            )}

            {/* 幹のかわいい顔 (レベル3-6) */}
            {level >= 3 && level <= 6 && (
              <>
                <circle cx="90" cy={155 - level * 3} r="3" fill="#4A3728" />
                <circle cx="110" cy={155 - level * 3} r="3" fill="#4A3728" />
                <path
                  d={`M95,${165 - level * 3} Q100,${170 - level * 3} 105,${165 - level * 3}`}
                  stroke="#4A3728"
                  strokeWidth="2"
                  fill="none"
                />
                {/* ほっぺ */}
                <circle cx="82" cy={160 - level * 3} r="4" fill="#FFB6C1" opacity="0.6" />
                <circle cx="118" cy={160 - level * 3} r="4" fill="#FFB6C1" opacity="0.6" />
              </>
            )}

            {/* 小鳥 (レベル6以上) */}
            {level >= 6 && (
              <motion.g
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ellipse cx={140 + level} cy={70 - level * 2} rx="6" ry="5" fill="#FFD700" />
                <circle cx={144 + level} cy={68 - level * 2} r="3" fill="#FFD700" />
                <circle cx={146 + level} cy={67 - level * 2} r="1" fill="#333" />
                <path d={`M${147 + level},${68 - level * 2} L${150 + level},${68 - level * 2}`} stroke="#FF6B35" strokeWidth="2" />
              </motion.g>
            )}

            {/* フルーツ (レベル8以上) */}
            {level >= 8 && (
              <>
                <motion.circle
                  cx="85"
                  cy={100 - level * 4}
                  r="5"
                  fill="#FF6B6B"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.circle
                  cx="115"
                  cy={95 - level * 4}
                  r="5"
                  fill="#FF6B6B"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </>
            )}
          </motion.g>
        )}

        {/* レベル10: 伝説のバオバブ特別エフェクト */}
        {level === 10 && (
          <>
            {/* オーラ */}
            <motion.ellipse
              cx="100"
              cy="100"
              rx="80"
              ry="90"
              fill="none"
              stroke="#FFD700"
              strokeWidth="2"
              opacity="0.5"
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* キラキラ */}
            {[
              { x: 30, y: 50 }, { x: 170, y: 60 }, { x: 50, y: 120 },
              { x: 150, y: 130 }, { x: 100, y: 30 }, { x: 75, y: 80 }, { x: 125, y: 75 }
            ].map((pos, i) => (
              <motion.text
                key={i}
                x={pos.x}
                y={pos.y}
                fontSize="14"
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              >
                ✨
              </motion.text>
            ))}
            {/* 王冠 */}
            <motion.text
              x="88"
              y="20"
              fontSize="20"
              animate={{ y: [20, 15, 20] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              👑
            </motion.text>
          </>
        )}
      </motion.svg>

      {/* レベル情報 */}
      <div style={{ marginTop: '8px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e' }}>
          Lv.{growth.level} {currentLevel.name}
        </h3>
        <p style={{ fontSize: '14px', color: '#d97706', marginTop: '4px' }}>{currentLevel.description}</p>
      </div>

      {/* ポイント・進捗 */}
      <div style={{ marginTop: '12px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#b45309', marginBottom: '4px' }}>
          <span>{growth.totalPoints} pt</span>
          {growth.level < 10 && <span>次まで {pointsToNext} pt</span>}
        </div>
        <div style={{ width: '100%', backgroundColor: '#fde68a', borderRadius: '9999px', height: '12px', overflow: 'hidden' }}>
          <motion.div
            style={{
              background: 'linear-gradient(to right, #4ade80, #10b981, #14b8a6)',
              height: '12px',
              borderRadius: '9999px',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  )
}
