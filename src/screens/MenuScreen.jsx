import React from 'react'
import { STORY_LIST } from '../stories/index.js'

// ============================================================
//  Экран выбора историй
//  Показывает доступные истории, прогресс, персонажей
// ============================================================

export function MenuScreen({ user, saveData, onSelectStory, onShare }) {
  return (
    <div style={{
      width: '100%', height: '100vh', overflowY: 'auto',
      background: 'linear-gradient(180deg, #0f0a1a 0%, #0a0a0a 100%)',
      fontFamily: "'Georgia', 'Palatino', serif",
      padding: '20px 16px',
    }}>

      {/* Шапка */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24,
      }}>
        <div>
          <div style={{
            fontSize: 20, fontWeight: 700, color: '#fff',
          }}>
            Истории
          </div>
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.35)',
            marginTop: 4,
          }}>
            Выбери главу для прохождения
          </div>
        </div>

        {/* Кнопка поделиться */}
        <button onClick={onShare} style={{
          padding: '8px 14px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, color: 'rgba(255,255,255,0.6)',
          fontSize: 12, cursor: 'pointer',
        }}>
          Поделиться 💌
        </button>
      </div>

      {/* Статистика игрока */}
      {saveData && (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: 16, marginBottom: 20,
          display: 'flex', gap: 16, justifyContent: 'space-around',
        }}>
          {Object.entries(saveData.affection || {}).map(([char, val]) => (
            <div key={char} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24 }}>
                {char === 'alex' ? '🤵' : '👩‍🦰'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                {char === 'alex' ? 'Алексей' : 'Диана'}
              </div>
              <div style={{ fontSize: 14, color: '#D4A0FF', marginTop: 2 }}>
                ❤️ {val}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Список историй */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {STORY_LIST.map((story) => {
          const isLocked = story.locked
          const progress = saveData?.completedScenes?.[story.id]

          return (
            <button
              key={story.id}
              onClick={() => !isLocked && onSelectStory(story.id)}
              style={{
                width: '100%', textAlign: 'left',
                background: isLocked
                  ? 'rgba(255,255,255,0.02)'
                  : 'linear-gradient(135deg, rgba(107,63,160,0.15) 0%, rgba(45,27,78,0.15) 100%)',
                border: `1px solid ${isLocked ? 'rgba(255,255,255,0.04)' : 'rgba(155,89,182,0.2)'}`,
                borderRadius: 16, padding: 16,
                cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked ? 0.4 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 10, letterSpacing: 2,
                    color: 'rgba(255,255,255,0.3)',
                    textTransform: 'uppercase',
                    fontFamily: "'Courier New', monospace",
                    marginBottom: 6,
                  }}>
                    {story.label}
                  </div>
                  <div style={{ fontSize: 16, color: '#fff', marginBottom: 6 }}>
                    {isLocked ? '🔒 ' : ''}{story.title}
                  </div>
                  <div style={{
                    fontSize: 12, color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.5,
                  }}>
                    {story.description}
                  </div>
                </div>

                {/* Обложка-эмодзи (замени на картинку потом) */}
                <div style={{
                  fontSize: 36, marginLeft: 12,
                  filter: isLocked ? 'grayscale(1)' : 'none',
                }}>
                  {story.cover}
                </div>
              </div>

              {/* Прогресс */}
              {progress !== undefined && (
                <div style={{ marginTop: 12 }}>
                  <div style={{
                    height: 3,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 2,
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #6B3FA0, #9B59B6)',
                    }} />
                  </div>
                  <div style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.25)',
                    marginTop: 4, textAlign: 'right',
                  }}>
                    {progress}% пройдено
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Футер */}
      <div style={{
        textAlign: 'center', marginTop: 32,
        fontSize: 11, color: 'rgba(255,255,255,0.15)',
      }}>
        Новые главы каждую неделю ✨
      </div>
    </div>
  )
}
