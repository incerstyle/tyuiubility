import React from "react"
import scheduleIcon from "url:~assets/schedule-icon.png"
import settingsIcon from "url:~assets/settings-icon.png"

type Screen = "home" | "schedule" | "settings"

export default function HomeScreen({
  onOpen
}: Readonly<{
  onOpen: (screen: Screen) => void
}>) {
  return (
    <div className="home-container">
      <h1 className="home-title">Tyuiubility</h1>

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