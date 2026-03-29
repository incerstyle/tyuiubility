import { useEffect, useState } from "react"
import browser from "webextension-polyfill"
import backButtonImg from "url:~assets/back-button.png"
import leftButtonImg from "url:~assets/left-button.png"
import rightButtonImg from "url:~assets/right-button.png"
import saveScheduleImg from "url:~assets/save-schedule-button.png"
import settingsIcon from "url:~assets/settings-icon.png"
import { MESSAGE_TYPE } from "~src/application/schedule/message-contract"
import { DAY_LABELS, isEvenWeek, WEEK_DAYS } from "~src/domain/schedule/week"
import type { GroupSchedulesMap, Lesson, StoredData } from "~src/domain/schedule/types"

interface ScheduleScreenProps {
  onBack: () => void
  onOpenSettings: () => void
  selectedGroupName: string | null
  onSelectGroupChange: (groupName: string | null) => void
}

function getPreferredGroupName(
  data: StoredData,
  selectedGroupName: string | null
): string | null {
  const groups = data.schedulesByGroup ?? {}

  if (selectedGroupName && groups[selectedGroupName]) {
    return selectedGroupName
  }

  const favoriteGroup = Object.entries(groups).find(([, group]) => group.isFavorite)
  if (favoriteGroup) {
    return favoriteGroup[0]
  }

  if (data.activeGroup && groups[data.activeGroup]) {
    return data.activeGroup
  }

  const firstGroup = Object.keys(groups)[0]
  return firstGroup ?? null
}

function getLessonTypeId(type: string): string {
  const typeMap: Record<string, string> = {
    "Лекция": "lecture",
    "Практика": "practice",
    "Лабораторная": "laboratory"
  }
  return typeMap[type]
}

export default function ScheduleScreen({
  onBack,
  onOpenSettings,
  selectedGroupName,
  onSelectGroupChange
}: Readonly<ScheduleScreenProps>) {
  const [groups, setGroups] = useState<GroupSchedulesMap>({})
  const [activeGroupName, setActiveGroupName] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  useEffect(() => {
    browser.runtime.sendMessage({ type: MESSAGE_TYPE.getSchedule })
      .then((data: StoredData) => {
        if (!data) return

        const nextGroups = data.schedulesByGroup ?? {}
          const nextActiveGroup = getPreferredGroupName(data, selectedGroupName)
        setGroups(nextGroups)
          setActiveGroupName(nextActiveGroup)
          onSelectGroupChange(nextActiveGroup)
      })
      .catch((err) => console.error("Ошибка получения данных:", err))
        }, [onSelectGroupChange, selectedGroupName])

  const activeGroup = activeGroupName ? groups[activeGroupName] : undefined

  const dayIndex = (currentDate.getDay() + 6) % 7
  const daySchedule = WEEK_DAYS[dayIndex]
  const isEven = isEvenWeek(currentDate)

  const lessons = ((isEven ? activeGroup?.even?.[daySchedule] : activeGroup?.odd?.[daySchedule]) ?? []) as Lesson[]

  const shortDate = {
    day: String(currentDate.getDate()).padStart(2, "0"),
    month: String(currentDate.getMonth() + 1).padStart(2, "0")
  }

  function changeDay(offset: number) {
    setCurrentDate((prev) => {
      const next = new Date(prev)
      next.setDate(prev.getDate() + offset)
      return next
    })
  }

  if (!activeGroup) {
    return (
      <div className="schedule-container">
        <header className="schedule-header">
          <button onClick={onBack} className="nav-button"><img src={backButtonImg} alt="◀ Назад"/></button>
          <h1>Расписание</h1>
        </header>
        <div className="schedule-error">
          <h2>Расписание не найдено</h2>
          <p>Перейди на сайт университета и нажми на <img src={saveScheduleImg} alt="Сохранить расписание"/></p>
        </div>
      </div>
    )
  }

  return (
    <div className="schedule-container">
      <header className="schedule-header">
        <button onClick={onBack} className="nav-button"><img src={backButtonImg} alt="◀ Назад"/></button>
        <h1>Расписание</h1>
        <button onClick={onOpenSettings} className="schedule-settings-button">
          <img src={settingsIcon} alt="Настройки расписания"/>
        </button>
      </header>

      {activeGroupName ? (
        <div className="schedule-group-name">Группа: {activeGroupName}</div>
      ) : null}

      <div className="schedule-date">
        <button onClick={() => changeDay(-1)} className="date-nav-button">
          <img src={leftButtonImg} alt="◀"/>
        </button>
        <h2 className="schedule-date-title">
          {DAY_LABELS[daySchedule]} {shortDate.day}.{shortDate.month}
        </h2>
        <button onClick={() => changeDay(1)} className="date-nav-button">
          <img src={rightButtonImg} alt="▶"/>
        </button>
      </div>

      {lessons.length === 0 ? (
        <p className="schedule-empty">Пар нет</p>
      ) : (
        lessons.map((l, idx) => (
          <div key={`${l.time}-${l.subject}-${l.subGroup || "all"}-${idx}`} className="lesson-card">
            <div className="left-column">
              <div className="lesson-time">{l.time}</div>
              <div className="lesson-subject">{l.subject}</div>
              <div className="lesson-meta">
                <div className={`lesson-type ${getLessonTypeId(l.type)}`}>
                  {l.type}
                </div>
                <div className="lesson-location">
                  {l.location}
                </div>
              </div>
              <div className="lesson-teacher">{l.teacher}</div>
            </div>
            {l.subGroup ? (
              <div className="right-column">
                <div className="lesson-subgroup">{l.subGroup}</div>
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  )
}