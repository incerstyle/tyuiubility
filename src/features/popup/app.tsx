import { useState } from "react"
import HomeScreen from "./home"
import ScheduleScreen from "./schedule"
import SettingsScreen from "./settings"

type Screen = "home" | "schedule" | "settings"

export default function App() {
  const [screen, setScreen] = useState<Screen>("home")

  if (screen === "schedule") {
    return <ScheduleScreen onBack={() => setScreen("home")} />
  }

  if (screen === "settings") {
    return <SettingsScreen onBack={() => setScreen("home")} />
  }

  return <HomeScreen onOpen={setScreen} />
}
