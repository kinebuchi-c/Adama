import { useState, useEffect } from 'react'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  source: string
  category: 'ai' | 'it'
}

export function ITNewsPanel() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // AI News (Google News Japan - AI topic)
      const aiRssUrl = encodeURIComponent('https://news.google.com/rss/search?q=AI+OR+人工知能+OR+ChatGPT+OR+生成AI&hl=ja&gl=JP&ceid=JP:ja')
      // IT News (Google News Japan - Tech topic)
      const techRssUrl = encodeURIComponent('https://news.google.com/rss/search?q=IT+OR+テクノロジー+OR+スタートアップ&hl=ja&gl=JP&ceid=JP:ja')

      const [aiResponse, techResponse] = await Promise.all([
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${aiRssUrl}`),
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${techRssUrl}`)
      ])

      const newsItems: NewsItem[] = []

      // AI News
      if (aiResponse.ok) {
        const aiData = await aiResponse.json()
        if (aiData.status === 'ok' && aiData.items) {
          aiData.items.slice(0, 3).forEach((item: { title: string; link: string; pubDate: string; author?: string }) => {
            // タイトルから「- ソース名」を除去
            const cleanTitle = item.title.replace(/ - [^-]+$/, '')
            newsItems.push({
              title: cleanTitle,
              link: item.link,
              pubDate: new Date(item.pubDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
              source: item.author || 'AI',
              category: 'ai',
            })
          })
        }
      }

      // Tech News
      if (techResponse.ok) {
        const techData = await techResponse.json()
        if (techData.status === 'ok' && techData.items) {
          techData.items.slice(0, 3).forEach((item: { title: string; link: string; pubDate: string; author?: string }) => {
            const cleanTitle = item.title.replace(/ - [^-]+$/, '')
            newsItems.push({
              title: cleanTitle,
              link: item.link,
              pubDate: new Date(item.pubDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
              source: item.author || 'IT',
              category: 'it',
            })
          })
        }
      }

      if (newsItems.length > 0) {
        setNews(newsItems)
      } else {
        throw new Error('No news fetched')
      }
    } catch (err) {
      console.error('News fetch error:', err)
      setError('ニュースを取得できませんでした')
      setNews([
        { title: 'ITmedia AI+', link: 'https://www.itmedia.co.jp/aiplus/', pubDate: '', source: 'ITmedia', category: 'ai' },
        { title: 'TechCrunch Japan', link: 'https://jp.techcrunch.com/', pubDate: '', source: 'TechCrunch', category: 'it' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const aiNews = news.filter(n => n.category === 'ai')
  const itNews = news.filter(n => n.category === 'it')

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    }}>
      {/* ヘッダー */}
      <div style={{
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        background: 'rgba(59, 130, 246, 0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px' }}>🌐</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6' }}>
            テックニュース
          </span>
        </div>
        <button
          onClick={fetchNews}
          style={{
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '4px',
            padding: '2px 6px',
            cursor: 'pointer',
            fontSize: '10px',
            color: '#6b7280',
          }}
          title="Refresh"
        >
          🔄
        </button>
      </div>

      {/* コンテンツ - 横並び */}
      <div style={{
        padding: '8px',
        display: 'flex',
        gap: '16px',
      }}>
        {isLoading ? (
          <div style={{
            padding: '12px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px',
            width: '100%',
          }}>
            読み込み中...
          </div>
        ) : error && news.length === 0 ? (
          <div style={{
            padding: '12px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px',
            width: '100%',
          }}>
            {error}
          </div>
        ) : (
          <>
            {/* AI News Section */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#8b5cf6',
                padding: '2px 4px',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span>🤖</span> AI
              </div>
              {aiNews.length > 0 ? (
                aiNews.map((item, index) => (
                  <NewsItemLink key={`ai-${index}`} item={item} />
                ))
              ) : (
                <div style={{ fontSize: '10px', color: '#9ca3af', padding: '4px' }}>ニュースなし</div>
              )}
            </div>

            {/* IT News Section */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#3b82f6',
                padding: '2px 4px',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span>💻</span> IT
              </div>
              {itNews.length > 0 ? (
                itNews.map((item, index) => (
                  <NewsItemLink key={`it-${index}`} item={item} />
                ))
              ) : (
                <div style={{ fontSize: '10px', color: '#9ca3af', padding: '4px' }}>ニュースなし</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function NewsItemLink({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        padding: '6px 8px',
        textDecoration: 'none',
        borderRadius: '6px',
        marginBottom: '2px',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f3f4f6'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <div style={{
        fontSize: '11px',
        fontWeight: 500,
        color: '#1f2937',
        lineHeight: 1.3,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {item.title}
      </div>
      <div style={{
        fontSize: '9px',
        color: '#9ca3af',
        marginTop: '2px',
        display: 'flex',
        gap: '6px',
      }}>
        {item.pubDate && <span>{item.pubDate}</span>}
        <span>{item.source}</span>
      </div>
    </a>
  )
}
