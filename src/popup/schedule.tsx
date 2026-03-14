import { useEffect, useState } from "react"
import browser from "webextension-polyfill"
import backButtonImg from "url:~assets/back-button.png"
import leftButtonImg from "url:~assets/left-button.png"
import rightButtonImg from "url:~assets/right-button.png"
import saveScheduleImg from "url:~assets/save-schedule-button.png"

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
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

type StoredData = {
  scheduleOdd?: WeekSchedule
  scheduleEven?: WeekSchedule
  savedAt?: number
}

const DAYS: (keyof WeekSchedule)[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
]

const DAY_LABELS: Record<keyof WeekSchedule, string> = {
  monday: "Пн.",
  tuesday: "Вт.",
  wednesday: "Ср.",
  thursday: "Чт.",
  friday: "Пт.",
  saturday: "Сб.",
  sunday: "Вс."
}

interface ScheduleScreenProps {
  onBack: () => void
}

function isEvenWeek(targetDate: Date): boolean {
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const year = target.getMonth() < 8 ? target.getFullYear() - 1 : target.getFullYear();
  const sept1 = new Date(year, 8, 1);
  sept1.setHours(0, 0, 0, 0);

  const dayOfWeek = sept1.getDay(); 
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const mondayOfFirstWeek = new Date(sept1);
  mondayOfFirstWeek.setDate(sept1.getDate() - diffToMonday);
  mondayOfFirstWeek.setHours(0, 0, 0, 0);

  const diffInMs = target.getTime() - mondayOfFirstWeek.getTime();
  const diffInDays = Math.round(diffInMs / 86400000);

  const weekNumber = Math.floor(diffInDays / 7) + 1;

  return weekNumber % 2 === 0;
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
  const [odd, setOdd] = useState<WeekSchedule | null>(null);
  const [even, setEven] = useState<WeekSchedule | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    browser.runtime.sendMessage({ type: "GET_SCHEDULE" })
      .then((data: StoredData) => {
        
        if (data) {
          setOdd(data.scheduleOdd ?? null);
          setEven(data.scheduleEven ?? null);
        }
      })
      .catch(err => console.error("Ошибка получения данных:", err));
  }, []);

  const dayIndex = (currentDate.getDay() + 6) % 7; 
  const daySchedule = DAYS[dayIndex];
  const isEven = isEvenWeek(currentDate);
  
  const lessons = (isEven ? even?.[daySchedule] : odd?.[daySchedule]) ?? [] as Lesson[];

  const shortDate = {
    day: String(currentDate.getDate()).padStart(2, "0"),
    month: String(currentDate.getMonth() + 1).padStart(2, "0")
  };

  function changeDay(offset: number) {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + offset);
      return next;
    });
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