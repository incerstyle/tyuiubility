import React from "react"
import scheduleIcon from "url:~assets/schedule-icon.png"
import settingsIcon from "url:~assets/settings-icon.png"
import githubIcon from "url:~assets/github-icon.png"
import telegramIcon from "url:~assets/telegram-icon.png"

type Screen = "home" | "schedule" | "settings"

export default function HomeScreen({
  onOpen
}: Readonly<{
  onOpen: (screen: Screen) => void
}>) {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Tyuiubility</h1>
        <button className="home-github-button" onClick={() => {
          window.open("https://github.com/incerstyle/tyuiubility");
        }}>
          <img src={githubIcon} alt="GitHub" className="home-github-icon"/>
        </button>
        <button className="home-telegram-button" onClick={() => {
          window.open("https://t.me/incerstyle");
        }}>
          <img src={telegramIcon} alt="Telegram" className="home-telegram-icon"/>
        </button>
      </div>

      <div className="home-grid">
        <Tile
          title="Расписание"
          icon={<img src={scheduleIcon} alt="Schedule" />}
          onClick={() => onOpen("schedule")}
        />

        <Tile
          title="Настройки"
          icon={<img src={settingsIcon} alt="Settings" />}
          onClick={() => onOpen("settings")}
        />
      </div>
    </div>
  )
}

function Tile({
  title,
  icon,
  onClick
}: Readonly<{
  title: string
  icon: React.ReactNode
  onClick: () => void
}>) {
  return (
    <button className="tile" onClick={onClick}>
      <div className="tile-icon">{icon}</div>
      <div className="tile-label">{title}</div>
    </button>
  )
}