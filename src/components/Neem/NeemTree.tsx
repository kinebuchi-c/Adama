import { motion } from 'framer-motion'
import { useNeemStore } from '../../stores/neemStore'

// 完成した木を描画するコンポーネント
function CompletedTree({ x, scale = 1 }: { x: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, 0) scale(${scale})`}>
      {/* 草 */}
      <ellipse cx="50" cy="95" rx="25" ry="5" fill="#7CCD7C" />

      {/* ニームの幹 */}
      <path
        d="M50,95 C42,95 38,80 40,65 C42,50 46,40 50,35 C54,40 58,50 60,65 C62,80 58,95 50,95"
        fill="#8B7355"
      />
      <path
        d="M48,90 C42,90 40,78 41,68 C42,58 45,50 48,47 C46,55 45,65 46,75 C46,82 47,90 48,90"
        fill="#A0896C"
        opacity="0.5"
      />

      {/* 枝 */}
      <path d="M42,55 Q32,45 25,42" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M58,55 Q68,45 75,42" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* ニームの葉っぱ（羽状複葉） */}
      <ellipse cx="50" cy="28" rx="22" ry="14" fill="#2E8B57" />
      <ellipse cx="50" cy="25" rx="20" ry="12" fill="#3CB371" />
      <ellipse cx="25" cy="38" rx="14" ry="9" fill="#2E8B57" />
      <ellipse cx="75" cy="38" rx="14" ry="9" fill="#2E8B57" />
    </g>
  )
}

export function NeemTree() {
  const { growth, getCurrentLevel, getProgressToNextLevel, getPointsToNextLevel, plantNewTree } = useNeemStore()
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
  const completedTrees = growth.completedTrees || 0
  const isMaxLevel = level === 10

  // 森の状態を判定
  const getForestStatus = () => {
    if (completedTrees >= 10) return { name: '大森林', emoji: '🌲🌳🌲' }
    if (completedTrees >= 5) return { name: '小さな森', emoji: '🌳🌳' }
    if (completedTrees >= 3) return { name: '木立', emoji: '🌳' }
    if (completedTrees >= 1) return { name: 'ニーム並木', emoji: '🌿' }
    return null
  }

  const forestStatus = getForestStatus()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px',
      background: 'linear-gradient(to bottom, #f0fff4, #c6f6d5)',
      borderRadius: '16px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    }}>
      {/* 森の表示（完成した木がある場合） */}
      {completedTrees > 0 && (
        <div style={{
          width: '100%',
          marginBottom: '8px',
          padding: '8px',
          background: 'linear-gradient(to bottom, #ecfdf5, #d1fae5)',
          borderRadius: '12px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>{forestStatus?.emoji}</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#065f46' }}>
              {forestStatus?.name}
            </span>
            <span style={{ fontSize: '12px', color: '#047857' }}>
              ({completedTrees}本)
            </span>
          </div>

          {/* 完成した木のSVG表示 */}
          <motion.svg
            viewBox="0 0 200 100"
            style={{ width: '100%', height: '60px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* 地面 */}
            <rect x="0" y="90" width="200" height="10" fill="#90EE90" rx="5" />

            {/* 完成した木を並べる（最大5本表示） */}
            {Array.from({ length: Math.min(completedTrees, 5) }).map((_, i) => (
              <CompletedTree
                key={i}
                x={10 + i * 38}
                scale={0.9 - (completedTrees > 3 ? 0.1 : 0)}
              />
            ))}

            {/* 5本以上ある場合は「...」表示 */}
            {completedTrees > 5 && (
              <text x="185" y="70" fontSize="16" fill="#065f46">+{completedTrees - 5}</text>
            )}
          </motion.svg>
        </div>
      )}

      {/* 現在育成中のニームSVG */}
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
            <circle cx="45" cy="195" r="4" fill="#E6E6FA" />
            <circle cx="155" cy="193" r="4" fill="#E6E6FA" />
            <circle cx="60" cy="198" r="3" fill="#DDA0DD" />
            <circle cx="140" cy="196" r="3" fill="#DDA0DD" />
          </>
        )}

        {/* レベル1: 種 */}
        {level === 1 && (
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <ellipse cx="100" cy="185" rx="10" ry="7" fill="#556B2F" />
            <ellipse cx="100" cy="183" rx="8" ry="5" fill="#6B8E23" />
            {/* かわいい顔 */}
            <circle cx="96" cy="183" r="1.5" fill="#2F4F2F" />
            <circle cx="104" cy="183" r="1.5" fill="#2F4F2F" />
            <path d="M98,186 Q100,188 102,186" stroke="#2F4F2F" strokeWidth="1" fill="none" />
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
            <rect x="97" y="170" width="6" height="20" rx="3" fill="#2E8B57" />
            {/* 双葉 */}
            <ellipse cx="90" cy="168" rx="10" ry="6" fill="#3CB371" transform="rotate(-30 90 168)" />
            <ellipse cx="110" cy="168" rx="10" ry="6" fill="#3CB371" transform="rotate(30 110 168)" />
            {/* かわいい顔 */}
            <circle cx="96" cy="175" r="1" fill="#155724" />
            <circle cx="104" cy="175" r="1" fill="#155724" />
            <path d="M98,178 Q100,180 102,178" stroke="#155724" strokeWidth="1" fill="none" />
          </motion.g>
        )}

        {/* レベル3以上: ニームの木 */}
        {level >= 3 && (
          <motion.g
            initial={{ scale: 0.5, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            {/* ニームのスリムな幹 */}
            <path
              d={`M100,190
                  C80,190 75,${175 - level * 2} 78,${155 - level * 4}
                  C80,${140 - level * 3} 88,${125 - level * 4} 100,${115 - level * 5}
                  C112,${125 - level * 4} 120,${140 - level * 3} 122,${155 - level * 4}
                  C125,${175 - level * 2} 120,190 100,190`}
              fill="#8B7355"
            />
            {/* 幹のハイライト */}
            <path
              d={`M95,185
                  C82,185 78,${172 - level * 2} 80,${158 - level * 4}
                  C82,${145 - level * 3} 88,${132 - level * 4} 95,${122 - level * 5}
                  C90,${135 - level * 4} 86,${150 - level * 3} 86,${165 - level * 2}
                  C86,175 88,185 95,185`}
              fill="#A0896C"
              opacity="0.5"
            />

            {/* 枝 */}
            {level >= 4 && (
              <>
                <path
                  d={`M85,${135 - level * 3} Q65,${115 - level * 2} 50,${105 - level * 2}`}
                  stroke="#8B7355"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={`M115,${135 - level * 3} Q135,${115 - level * 2} 150,${105 - level * 2}`}
                  stroke="#8B7355"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}

            {/* ニームの羽状複葉 */}
            {level >= 3 && (
              <>
                {/* 中央の葉 */}
                <ellipse cx="100" cy={85 - level * 5} rx={22 + level * 2} ry={16 + level * 1.5} fill="#2E8B57" />
                <ellipse cx="100" cy={80 - level * 5} rx={20 + level * 2} ry={14 + level * 1.5} fill="#3CB371" />
              </>
            )}

            {level >= 5 && (
              <>
                {/* 左の葉 */}
                <ellipse cx={52 - level} cy={95 - level * 3} rx={16 + level} ry={13 + level * 0.8} fill="#2E8B57" />
                <ellipse cx={52 - level} cy={92 - level * 3} rx={14 + level} ry={11 + level * 0.8} fill="#3CB371" />
                {/* 右の葉 */}
                <ellipse cx={148 + level} cy={95 - level * 3} rx={16 + level} ry={13 + level * 0.8} fill="#2E8B57" />
                <ellipse cx={148 + level} cy={92 - level * 3} rx={14 + level} ry={11 + level * 0.8} fill="#3CB371" />
              </>
            )}

            {level >= 7 && (
              <>
                {/* 追加の葉 */}
                <ellipse cx={68} cy={68 - level * 3} rx={13 + level * 0.5} ry={11} fill="#2E8B57" />
                <ellipse cx={132} cy={68 - level * 3} rx={13 + level * 0.5} ry={11} fill="#2E8B57" />
              </>
            )}

            {/* 幹のかわいい顔 (レベル3-6) */}
            {level >= 3 && level <= 6 && (
              <>
                <circle cx="92" cy={155 - level * 3} r="3" fill="#4A3728" />
                <circle cx="108" cy={155 - level * 3} r="3" fill="#4A3728" />
                <path
                  d={`M96,${165 - level * 3} Q100,${170 - level * 3} 104,${165 - level * 3}`}
                  stroke="#4A3728"
                  strokeWidth="2"
                  fill="none"
                />
                {/* ほっぺ */}
                <circle cx="84" cy={160 - level * 3} r="4" fill="#98FB98" opacity="0.6" />
                <circle cx="116" cy={160 - level * 3} r="4" fill="#98FB98" opacity="0.6" />
              </>
            )}

            {/* 小鳥 (レベル6以上) */}
            {level >= 6 && (
              <motion.g
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ellipse cx={140 + level} cy={70 - level * 2} rx="6" ry="5" fill="#87CEEB" />
                <circle cx={144 + level} cy={68 - level * 2} r="3" fill="#87CEEB" />
                <circle cx={146 + level} cy={67 - level * 2} r="1" fill="#333" />
                <path d={`M${147 + level},${68 - level * 2} L${150 + level},${68 - level * 2}`} stroke="#FFA500" strokeWidth="2" />
              </motion.g>
            )}

            {/* ニームの実 (レベル8以上) - 小さな緑色の実 */}
            {level >= 8 && (
              <>
                <motion.ellipse
                  cx="85"
                  cy={100 - level * 4}
                  rx="4"
                  ry="5"
                  fill="#9ACD32"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.ellipse
                  cx="115"
                  cy={95 - level * 4}
                  rx="4"
                  ry="5"
                  fill="#9ACD32"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <motion.ellipse
                  cx="100"
                  cy={88 - level * 4}
                  rx="4"
                  ry="5"
                  fill="#9ACD32"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
              </>
            )}
          </motion.g>
        )}

        {/* レベル10: 伝説のニーム特別エフェクト */}
        {level === 10 && (
          <>
            {/* オーラ */}
            <motion.ellipse
              cx="100"
              cy="100"
              rx="80"
              ry="90"
              fill="none"
              stroke="#98FB98"
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
                🌿
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
        <div style={{ fontSize: '12px', color: '#68D391', fontWeight: 500, marginBottom: '4px' }}>
          Neem Chan
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2E8B57' }}>
          Lv.{growth.level} {currentLevel.name}
        </h3>
        <p style={{ fontSize: '14px', color: '#3CB371', marginTop: '4px' }}>{currentLevel.description}</p>
      </div>

      {/* ポイント・進捗 */}
      <div style={{ marginTop: '12px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#2E8B57', marginBottom: '4px' }}>
          <span>{growth.totalPoints} pt</span>
          {!isMaxLevel && <span>次まで {pointsToNext} pt</span>}
        </div>
        <div style={{ width: '100%', backgroundColor: '#c6f6d5', borderRadius: '9999px', height: '12px', overflow: 'hidden' }}>
          <motion.div
            style={{
              background: 'linear-gradient(to right, #48bb78, #38a169, #2f855a)',
              height: '12px',
              borderRadius: '9999px',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* レベル10到達時の「新しい木を植える」ボタン */}
      {isMaxLevel && (
        <motion.button
          onClick={plantNewTree}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            marginTop: '16px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #38a169, #2f855a)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(56, 161, 105, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🌱</span>
          <span>新しい木を植える</span>
        </motion.button>
      )}
    </div>
  )
}
