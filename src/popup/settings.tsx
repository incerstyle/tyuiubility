import backButtonImg from "url:~assets/back-button.png"

interface SettingsScreenProps {
  onBack: () => void
}

export default function SettingsScreen({ onBack }: Readonly<SettingsScreenProps>) {
  return (
    <div className="settings-container">

      <header className="settings-header">
        <button onClick={onBack} className="nav-button">
          <img src={backButtonImg} alt="Назад"/>
        </button>

        <h1 className="settings-page-title">Настройки</h1>
      </header>

      <div className="settings-card">

        <div className="settings-row">
          <span className="settings-label">Версия приложения</span>
          <span className="settings-value">1.0.2</span>
        </div>

      </div>

    </div>
  )
}