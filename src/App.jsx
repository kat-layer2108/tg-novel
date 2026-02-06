import React, { useState, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import { NovelEngine } from './engine/NovelEngine.jsx'
import { TitleScreen } from './screens/TitleScreen.jsx'
import { MenuScreen } from './screens/MenuScreen.jsx'

// ============================================================
//  Главный компонент — точка входа в приложение
//  Здесь происходит инициализация Telegram SDK,
//  загрузка сохранений и маршрутизация экранов
// ============================================================

export default function App() {
  const [screen, setScreen] = useState('title')    // title | menu | game
  const [user, setUser] = useState(null)            // данные пользователя из Telegram
  const [saveData, setSaveData] = useState(null)    // сохранённый прогресс
  const [currentStory, setCurrentStory] = useState(null) // выбранная история

  // ---- Инициализация Telegram Web App ----
  useEffect(() => {
    try {
      // Сообщаем Telegram что приложение готово
      WebApp.ready()

      // Разворачиваем на весь экран
      WebApp.expand()

      // Отключаем вертикальные свайпы (чтобы не закрывалось случайно)
      if (WebApp.disableVerticalSwipes) {
        WebApp.disableVerticalSwipes()
      }

      // Получаем данные пользователя
      if (WebApp.initDataUnsafe?.user) {
        setUser({
          id: WebApp.initDataUnsafe.user.id,
          name: WebApp.initDataUnsafe.user.first_name,
          username: WebApp.initDataUnsafe.user.username,
          photo: WebApp.initDataUnsafe.user.photo_url,
        })
      }

      // Загружаем сохранение из CloudStorage
      loadProgress()

    } catch (e) {
      // Если запущено не в Telegram (например, в браузере для отладки)
      console.log('Telegram SDK не доступен, работаем в режиме отладки')
      setUser({ id: 0, name: 'Отладка', username: 'debug' })
    }
  }, [])

  // ---- Кнопка "Назад" в Telegram ----
  useEffect(() => {
    if (screen === 'game' || screen === 'menu') {
      WebApp.BackButton?.show()
    } else {
      WebApp.BackButton?.hide()
    }

    const handleBack = () => {
      if (screen === 'game') setScreen('menu')
      else if (screen === 'menu') setScreen('title')
    }

    WebApp.onEvent?.('backButtonClicked', handleBack)
    return () => WebApp.offEvent?.('backButtonClicked', handleBack)
  }, [screen])

  // ---- Сохранение/загрузка прогресса ----
  // Telegram CloudStorage — хранит данные на серверах Telegram
  // Работает без бэкенда, привязано к пользователю

  async function loadProgress() {
    try {
      // Сначала пробуем Telegram CloudStorage
      if (WebApp.CloudStorage) {
        WebApp.CloudStorage.getItem('saveData', (err, value) => {
          if (!err && value) {
            setSaveData(JSON.parse(value))
          }
        })
      } else {
        // Фоллбэк на localStorage для отладки в браузере
        const saved = localStorage.getItem('novel_save')
        if (saved) setSaveData(JSON.parse(saved))
      }
    } catch (e) {
      console.log('Ошибка загрузки сохранения:', e)
    }
  }

  function saveProgress(data) {
    const payload = JSON.stringify(data)
    try {
      if (WebApp.CloudStorage) {
        WebApp.CloudStorage.setItem('saveData', payload)
      }
      localStorage.setItem('novel_save', payload)
      setSaveData(data)
    } catch (e) {
      console.log('Ошибка сохранения:', e)
    }
  }

  // ---- Хаптик (вибрация) ----
  function haptic(type = 'light') {
    try {
      if (type === 'light') WebApp.HapticFeedback?.impactOccurred('light')
      if (type === 'medium') WebApp.HapticFeedback?.impactOccurred('medium')
      if (type === 'success') WebApp.HapticFeedback?.notificationOccurred('success')
      if (type === 'error') WebApp.HapticFeedback?.notificationOccurred('error')
    } catch (e) {}
  }

  // ---- Шаринг ----
  function shareGame() {
    try {
      // Ссылка на бота — замени на свою
      const botUrl = 'https://t.me/your_bot_name/app'
      const text = '✨ Играю в "Петербургские Истории" — визуальную новеллу прямо в Telegram!'
      WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(text)}`)
    } catch (e) {
      console.log('Шаринг не доступен')
    }
  }

  // ---- Маршрутизация экранов ----

  if (screen === 'title') {
    return (
      <TitleScreen
        user={user}
        hasSave={!!saveData}
        onStart={() => {
          haptic('medium')
          setScreen('menu')
        }}
      />
    )
  }

  if (screen === 'menu') {
    return (
      <MenuScreen
        user={user}
        saveData={saveData}
        onSelectStory={(storyId) => {
          haptic('medium')
          setCurrentStory(storyId)
          setScreen('game')
        }}
        onShare={shareGame}
      />
    )
  }

  if (screen === 'game') {
    return (
      <NovelEngine
        storyId={currentStory}
        saveData={saveData}
        user={user}
        onSave={saveProgress}
        onExit={() => {
          haptic('light')
          setScreen('menu')
        }}
        onHaptic={haptic}
      />
    )
  }

  return null
}
