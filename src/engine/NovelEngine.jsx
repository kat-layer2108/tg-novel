import React, { useState, useEffect, useCallback, useRef } from 'react'
import { getStoryData } from '../stories/index.js'

// ============================================================
//  NovelEngine — ядро визуальной новеллы
//
//  Это универсальный движок. Он НЕ знает про конкретные истории.
//  Он берёт данные истории (scenes, characters, backgrounds)
//  и рендерит их. Чтобы добавить новую историю — создай
//  новый файл в stories/ и не трогай движок.
// ============================================================

export function NovelEngine({ storyId, saveData, user, onSave, onExit, onHaptic }) {
  const story = getStoryData(storyId)

  const [sceneId, setSceneId] = useState(story?.startScene || 'start')
  const [lineIndex, setLineIndex] = useState(0)
  const [showChoices, setShowChoices] = useState(false)
  const [typingDone, setTypingDone] = useState(false)
  const [affection, setAffection] = useState(saveData?.affection || {})
  const [energy, setEnergy] = useState(saveData?.energy ?? 5)
  const [fadeIn, setFadeIn] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [visitedScenes, setVisitedScenes] = useState(new Set())

  const scene = story?.scenes?.[sceneId]
  const bg = scene ? (story.backgrounds[scene.bg] || {}) : {}
  const currentLine = scene?.lines?.[lineIndex]
  const speaker = currentLine ? (story.characters[currentLine.speaker] || {}) : {}

  // ---- Автосохранение при смене сцены ----
  useEffect(() => {
    if (sceneId && !gameOver) {
      onSave?.({
        storyId,
        sceneId,
        lineIndex: 0,
        affection,
        energy,
        completedScenes: {
          ...saveData?.completedScenes,
          [storyId]: Math.round((visitedScenes.size / Object.keys(story?.scenes || {}).length) * 100),
        },
      })
    }
  }, [sceneId])

  // ---- Переход к следующей сцене ----
  const goToScene = useCallback((nextId) => {
    if (nextId === '__END__') {
      setGameOver(true)
      onHaptic?.('success')
      return
    }
    setFadeIn(false)
    setTimeout(() => {
      setSceneId(nextId)
      setLineIndex(0)
      setShowChoices(false)
      setTypingDone(false)
      setFadeIn(true)
      setVisitedScenes(prev => new Set([...prev, nextId]))
    }, 300)
  }, [onHaptic])

  // ---- Обработка тапа по экрану ----
  const handleTap = useCallback(() => {
    if (!scene || showChoices || gameOver) return

    // Если текст ещё печатается — показать сразу
    if (!typingDone) {
      setTypingDone(true)
      return
    }

    onHaptic?.('light')

    // Следующая реплика
    if (lineIndex < scene.lines.length - 1) {
      setLineIndex(i => i + 1)
      setTypingDone(false)
    }
    // Показать выборы или перейти дальше
    else if (scene.choices) {
      setShowChoices(true)
    }
    else if (scene.next) {
      goToScene(scene.next)
    }
  }, [scene, lineIndex, showChoices, typingDone, gameOver, goToScene, onHaptic])

  // ---- Обработка выбора ----
  const handleChoice = useCallback((choice) => {
    onHaptic?.('medium')

    // Обновить отношения
    if (choice.affection) {
      setAffection(prev => {
        const next = { ...prev }
        Object.entries(choice.affection).forEach(([char, val]) => {
          next[char] = (next[char] || 0) + val
        })
        return next
      })
    }

    // Списать энергию за премиум-выбор
    if (choice.premium) {
      if (energy <= 0) {
        onHaptic?.('error')
        return  // Не хватает энергии
      }
      setEnergy(e => e - 1)
    }

    goToScene(choice.next)
  }, [energy, goToScene, onHaptic])

  // ---- Если история не найдена ----
  if (!story) {
    return (
      <div style={{ ...fullScreen, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: 16 }}>История не найдена 😕</div>
        <button onClick={onExit} style={btnStyle}>Назад</button>
      </div>
    )
  }

  // ---- Экран завершения ----
  if (gameOver) {
    return (
      <div style={{ ...fullScreen, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <div style={{
          fontSize: 11, letterSpacing: 5, color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase', fontFamily: "'Courier New', monospace",
          marginBottom: 24,
        }}>
          Конец главы
        </div>
        <div style={{ fontSize: 26, color: '#fff', fontFamily: "'Georgia', serif", marginBottom: 32 }}>
          Продолжение следует...
        </div>

        {/* Итоги отношений */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 16, padding: 20, width: '100%', maxWidth: 320,
          border: '1px solid rgba(255,255,255,0.08)', marginBottom: 32,
        }}>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 2,
            textTransform: 'uppercase', fontFamily: "'Courier New', monospace", marginBottom: 16,
          }}>
            Ваши отношения
          </div>
          {Object.entries(story.characters)
            .filter(([id]) => id !== 'narrator')
            .map(([id, char]) => (
            <div key={id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#fff', fontSize: 14 }}>{char.emoji} {char.name}</span>
                <span style={{ color: char.color, fontSize: 13 }}>❤️ {affection[id] || 0}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: `${Math.min(100, (affection[id] || 0) * 12)}%`,
                  background: `linear-gradient(90deg, ${char.color}, ${char.color}88)`,
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          ))}
        </div>

        <button onClick={onExit} style={{
          ...btnStyle,
          background: 'linear-gradient(135deg, #6B3FA0, #9B59B6)',
          boxShadow: '0 4px 20px rgba(155,89,182,0.3)',
        }}>
          К списку историй
        </button>
      </div>
    )
  }

  // ---- Основной игровой экран ----
  return (
    <div style={fullScreen}>
      <style>{animCSS}</style>

      {/* HUD — верхняя панель */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
      }}>
        <div style={badgeStyle}>⚡ {energy}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(story.characters)
            .filter(([id]) => id !== 'narrator' && affection[id] !== undefined)
            .map(([id, char]) => (
            <div key={id} style={badgeStyle}>
              {id === 'alex' ? '💙' : '💗'} {affection[id] || 0}
            </div>
          ))}
        </div>
      </div>

      {/* Фон */}
      <div style={{
        position: 'absolute', inset: 0,
        background: bg.image ? `url(${bg.image}) center/cover` : bg.gradient,
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}>
        {/* Атмосферные элементы */}
        {bg.ambience?.map((el, i) => (
          <div key={i} style={{
            position: 'absolute',
            fontSize: 18 + Math.random() * 14,
            left: `${10 + i * 22}%`,
            top: `${15 + (i % 3) * 20}%`,
            opacity: 0.1,
            animation: `floatEl ${4 + i}s ease-in-out infinite ${i * 0.5}s`,
          }}>
            {el}
          </div>
        ))}
      </div>

      {/* Метка локации */}
      {bg.label && (
        <div style={{
          position: 'absolute', top: 52, left: 16, zIndex: 5,
          fontSize: 10, color: 'rgba(255,255,255,0.3)',
          letterSpacing: 1.5, textTransform: 'uppercase',
          fontFamily: "'Courier New', monospace",
        }}>
          {bg.label}
        </div>
      )}

      {/* Персонаж */}
      {scene.character && (
        <div style={{
          position: 'absolute', bottom: 220, left: '50%',
          transform: 'translateX(-50%)', textAlign: 'center',
          opacity: fadeIn ? 1 : 0, transition: 'all 0.4s ease', zIndex: 3,
        }}>
          {/* Когда будут спрайты: <img src={char.sprites[emotion]} /> */}
          <div style={{ fontSize: 80, filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }}>
            {story.characters[scene.character]?.emoji}
          </div>
          <div style={{
            marginTop: 8, fontSize: 12, letterSpacing: 2,
            textTransform: 'uppercase', fontFamily: "'Courier New', monospace",
            color: story.characters[scene.character]?.color,
          }}>
            {story.characters[scene.character]?.name}
          </div>
        </div>
      )}

      {/* Область тапа */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 8,
      }} onClick={!showChoices ? handleTap : undefined} />

      {/* Диалоговое окно */}
      {currentLine && !showChoices && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
          background: 'linear-gradient(180deg, rgba(10,10,15,0.85), rgba(10,10,15,0.95))',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '18px 20px 24px',
          minHeight: 160,
        }}>
          {/* Имя говорящего */}
          <div style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
            textTransform: 'uppercase', marginBottom: 8,
            fontFamily: "'Courier New', monospace",
            color: speaker.name ? speaker.color : '#666',
            fontStyle: speaker.name ? 'normal' : 'italic',
          }}>
            {speaker.name || '✦'}
          </div>

          {/* Текст */}
          <div style={{
            fontSize: 15, lineHeight: 1.65,
            color: 'rgba(255,255,255,0.88)',
            fontFamily: "'Georgia', serif",
            minHeight: 50,
          }}>
            {typingDone ? (
              currentLine.text
            ) : (
              <Typewriter
                text={currentLine.text}
                speed={25}
                onDone={() => setTypingDone(true)}
              />
            )}
          </div>

          {typingDone && (
            <div style={{
              position: 'absolute', bottom: 8, right: 16,
              fontSize: 11, color: 'rgba(255,255,255,0.2)',
              fontFamily: "'Courier New', monospace",
            }}>
              нажмите ▸
            </div>
          )}
        </div>
      )}

      {/* Варианты выбора */}
      {showChoices && scene.choices && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
          background: 'linear-gradient(180deg, rgba(10,10,15,0.85), rgba(10,10,15,0.95))',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '16px',
        }}>
          <div style={{
            fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase', fontFamily: "'Courier New', monospace",
            marginBottom: 12, paddingLeft: 4,
          }}>
            Ваш выбор
          </div>
          {scene.choices.map((choice, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); handleChoice(choice) }}
              style={{
                width: '100%', textAlign: 'left',
                padding: '14px 16px', marginBottom: 8,
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                background: choice.premium
                  ? 'linear-gradient(135deg, rgba(155,89,182,0.15), rgba(107,63,160,0.1))'
                  : 'rgba(255,255,255,0.04)',
                color: '#fff', fontSize: 14,
                fontFamily: "'Georgia', serif",
                cursor: 'pointer',
                opacity: (choice.premium && energy <= 0) ? 0.4 : 1,
                animation: `slideUp 0.3s ease ${i * 0.08}s both`,
              }}
            >
              {choice.text}
              {choice.premium && (
                <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.5 }}>⚡1</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---- Компонент печатающегося текста ----
function Typewriter({ text, speed = 30, onDone }) {
  const [shown, setShown] = useState('')
  const idx = useRef(0)

  useEffect(() => {
    setShown('')
    idx.current = 0
    const iv = setInterval(() => {
      idx.current++
      if (idx.current <= text.length) {
        setShown(text.slice(0, idx.current))
      } else {
        clearInterval(iv)
        onDone?.()
      }
    }, speed)
    return () => clearInterval(iv)
  }, [text])

  return (
    <span>
      {shown}
      <span style={{
        display: 'inline-block', width: 2, height: 15,
        background: 'rgba(255,255,255,0.5)',
        marginLeft: 2, verticalAlign: 'middle',
        animation: 'blink 0.8s infinite',
      }} />
    </span>
  )
}

// ---- Стили ----
const fullScreen = {
  width: '100%', height: '100vh',
  position: 'relative', overflow: 'hidden',
  background: '#0a0a0a',
  fontFamily: "'Georgia', 'Palatino', serif",
}

const badgeStyle = {
  display: 'flex', alignItems: 'center', gap: 4,
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: 20, padding: '5px 10px',
  fontSize: 13, color: '#fff',
  border: '1px solid rgba(255,255,255,0.08)',
}

const btnStyle = {
  padding: '14px 40px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 30, color: '#fff',
  fontSize: 14, fontFamily: "'Georgia', serif",
  cursor: 'pointer',
}

const animCSS = `
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes floatEl { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
`
