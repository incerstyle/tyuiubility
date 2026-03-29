import { useEffect, useState } from "react"
import browser from "webextension-polyfill"
import backButtonImg from "url:~assets/back-button.png"
import leftButtonImg from "url:~assets/left-button.png"
import rightButtonImg from "url:~assets/right-button.png"
import saveScheduleImg from "url:~assets/save-schedule-button.png"
import deleteScheduleImg from "url:~assets/trash.png"
import { MESSAGE_TYPE } from "~src/application/schedule/message-contract"
import { DAY_LABELS, isEvenWeek, WEEK_DAYS } from "~src/domain/schedule/week"
import type { Lesson, StoredData, WeekSchedule } from "~src/domain/schedule/types"

interface ScheduleScreenProps {
  onBack: () => void
}


function getLessonTypeId(type: string): string {
  const typeMap: Record<string, string> = {
    "Лекция": "lecture",
    "Практика": "practice",
    "Лабораторная": "laboratory"
  }
  return typeMap[type]
}

export default function ScheduleScreen({ onBack }: Readonly<ScheduleScreenProps>) {
  const [odd, setOdd] = useState<WeekSchedule | null>(null);
  const [even, setEven] = useState<WeekSchedule | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    browser.runtime.sendMessage({ type: MESSAGE_TYPE.getSchedule })
      .then((data: StoredData) => {
        
        if (data) {
          setOdd(data.scheduleOdd ?? null);
          setEven(data.scheduleEven ?? null);
        }
      })
      .catch(err => console.error("Ошибка получения данных:", err));
  }, []);

  const dayIndex = (currentDate.getDay() + 6) % 7; 
  const daySchedule = WEEK_DAYS[dayIndex];
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

  function deleteSchedule() {
    browser.runtime.sendMessage({ type: MESSAGE_TYPE.deleteSchedule })
      .then(() => {
        setOdd(null);
        setEven(null);
      })
      .catch(err => console.error("Ошибка удаления данных:", err));
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
        <button onClick={deleteSchedule} className="delete-schedule-button">
          <img src={deleteScheduleImg} alt="Удалить расписание"/>
        </button>
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