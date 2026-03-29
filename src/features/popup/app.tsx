import { useState } from "react"
import HomeScreen from "./home"
import ScheduleScreen from "./schedule"
import SettingsScreen from "./settings"

type Screen = "home" | "schedule" | "settings"

export default function App() {
  const [screen, setScreen] = useState<Screen>("home")
  const [previousScreen, setPreviousScreen] = useState<Screen>("home")
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null)

  function openScreen(nextScreen: Screen) {
    setPreviousScreen(screen)
    setScreen(nextScreen)
  }

  if (screen === "schedule") {
    return (
      <ScheduleScreen
        onBack={() => setScreen("home")}
        onOpenSettings={() => openScreen("settings")}
        selectedGroupName={selectedGroupName}
        onSelectGroupChange={setSelectedGroupName}
      />
    )
  }

  if (screen === "settings") {
    return (
      <SettingsScreen
        onBack={() => setScreen(previousScreen === "settings" ? "home" : previousScreen)}
        selectedGroupName={selectedGroupName}
        onSelectGroupChange={setSelectedGroupName}
      />
    )
  }

  return <HomeScreen onOpen={openScreen} />
}
