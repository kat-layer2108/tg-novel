import React, { useState, useEffect } from 'react'

export function TitleScreen({ user, hasSave, onStart }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setTimeout(() => setShow(true), 100)
  }, [])

  return (
    <div style={{
      width: '100%', height: '100vh',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      background: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 40%, #0a0a0a 100%)',
      fontFamily: "'Georgia', 'Palatino', serif",
      textAlign: 'center', padding: 32,
      opacity: show ? 1 : 0,
      transition: 'opacity 0.8s ease',
    }}>

      {/* Дождь */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 25 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: -20,
            width: 1, height: 15,
            background: `rgba(200,220,255,${0.1 + Math.random() * 0.15})`,
            animation: `rainFall ${0.5 + Math.random() * 0.5}s ${Math.random() * 2}s linear infinite`,
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 5 }}>
        <div style={{
          fontSize: 11, letterSpacing: 5,
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
          marginBottom: 24,
          fontFamily: "'Courier New', monospace",
        }}>
          Visual Novel
        </div>

        {/* Название — ЗАМЕНИ НА СВОЁ */}
        <div style={{
          fontSize: 36, fontWeight: 700, color: '#fff',
          lineHeight: 1.2, marginBottom: 8,
          textShadow: '0 0 40px rgba(200,150,255,0.3)',
        }}>
          Петербургские
        </div>
        <div style={{
          fontSize: 40, fontWeight: 700,
          color: '#D4A0FF', fontStyle: 'italic',
          lineHeight: 1.2, marginBottom: 32,
          textShadow: '0 0 40px rgba(200,150,255,0.4)',
        }}>
          Истории
        </div>

        <div style={{
          fontSize: 13, color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.7, marginBottom: 40, maxWidth: 280,
        }}>
          Осень. Дождь. Случайная встреча.<br />
          Каждый выбор меняет судьбу.
        </div>

        {/* Приветствие пользователя */}
        {user?.name && (
          <div style={{
            fontSize: 13, color: 'rgba(255,255,255,0.3)',
            marginBottom: 24,
          }}>
            Привет, {user.name} ✨
          </div>
        )}

        <button onClick={onStart} style={{
          padding: '16px 48px',
          background: 'linear-gradient(135deg, #6B3FA0 0%, #9B59B6 100%)',
          border: 'none', borderRadius: 30, color: '#fff',
          fontSize: 15, fontFamily: "'Georgia', serif",
          letterSpacing: 2, textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: '0 4px 30px rgba(155,89,182,0.4)',
        }}>
          {hasSave ? 'Продолжить' : 'Начать'}
        </button>

        {hasSave && (
          <div style={{
            marginTop: 12, fontSize: 11,
            color: 'rgba(255,255,255,0.2)',
          }}>
            Есть сохранение
          </div>
        )}
      </div>

      <style>{`
        @keyframes rainFall {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
