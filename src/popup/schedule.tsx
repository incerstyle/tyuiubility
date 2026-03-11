import { useEffect, useState } from "react"
import browser from "webextension-polyfill"
import backButtonImg from "~assets/back-button.png"
import leftButtonImg from "~assets/left-button.png"
import rightButtonImg from "~assets/right-button.png"
import saveScheduleImg from "~assets/save-schedule-button.png"

type Lesson = {
  time: string
  subject: string
  subGroup: string
  type: string
  location: string
  teacher: string
}

type DaySchedule = Lesson[]

type WeekSchedule = {
  sunday: DaySchedule
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
}

type StoredData = {
  scheduleOdd?: WeekSchedule
  scheduleEven?: WeekSchedule
  savedAt?: number
}

type ShortDate = {
  day: string
  month: string
}

const DAYS: (keyof WeekSchedule)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
]

const DAY_LABELS: Record<keyof WeekSchedule, string> = {
  sunday: "Вс.",
  monday: "Пн.",
  tuesday: "Вт.",
  wednesday: "Ср.",
  thursday: "Чт.",
  friday: "Пт.",
  saturday: "Сб."
}

interface ScheduleScreenProps {
  onBack: () => void
}

function getTodayKey(): keyof WeekSchedule {
  const jsDay = new Date().getDay()
  return DAYS[jsDay]
}

function isEvenWeek(): boolean {
  const date = new Date()
  const start = new Date(date.getMonth() < 9 ? date.getFullYear() - 1 : date.getFullYear(), 9, 1)
  const diff = +date - +start
  const week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
  return week % 2 === 0
}

function getLessonTypeId(type: string): string {
  const typeMap: Record<string, string> = {
    "Лекция": "lecture",
    "Практика": "practice",
    "Лабораторная": "laboratory"
  }
  return typeMap[type] ?? "lab"
}

export default function ScheduleScreen({ onBack }: Readonly<ScheduleScreenProps>) {
  const [odd, setOdd] = useState<WeekSchedule | null>(null)
  const [even, setEven] = useState<WeekSchedule | null>(null)
  const [daySchedule, setDaySchedule] = useState<keyof WeekSchedule>(getTodayKey())
  const [week, setWeek] = useState<"even" | "odd">(isEvenWeek() ? "even" : "odd")
  let lessons = (week === "even" ? even?.[daySchedule] ?? [] : odd?.[daySchedule] ?? []) as Lesson[]
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  function getShortDate(date: Date): ShortDate {
    return {
      day: String(date.getDate()).padStart(2, "0"),
      month: String(date.getMonth() + 1).padStart(2, "0")
    }
  }

  const shortDate = getShortDate(currentDate);

  useEffect(() => {
    browser.runtime
      .sendMessage({ type: "GET_SCHEDULE" })
      .then((data: StoredData) => {
        setOdd(data.scheduleOdd ?? null)
        setEven(data.scheduleEven ?? null)
      })
  }, [])

  function switchWeek() {
    setWeek(week === "even" ? "odd" : "even")
  }

  function prevDay() {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 1)
    setCurrentDate(newDate)

    const i = DAYS.indexOf(daySchedule)
    setDaySchedule(DAYS[(i - 1 + DAYS.length) % DAYS.length])
    if (i == 0) {
      switchWeek()
    }
  }

  function nextDay() {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 1)
    setCurrentDate(newDate)

    const i = DAYS.indexOf(daySchedule)
    setDaySchedule(DAYS[(i + 1) % DAYS.length])
    if (i == 6) {
      switchWeek()
    }
  }

  if (!odd && !even) {
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
      </header>

      <div className="schedule-date">
        <button onClick={prevDay} className="date-nav-button">
          <img src={leftButtonImg} alt="◀"/>
          </button>
        <h2 className="schedule-date-title">
          {DAY_LABELS[daySchedule]} {shortDate.day}.{shortDate.month}
          </h2>
        <button onClick={nextDay} className="date-nav-button">
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