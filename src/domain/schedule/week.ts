import type { Weekday } from "./types"

export const WEEK_DAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
]

export const DAY_LABELS: Record<Weekday, string> = {
  monday: "Пн.",
  tuesday: "Вт.",
  wednesday: "Ср.",
  thursday: "Чт.",
  friday: "Пт.",
  saturday: "Сб.",
  sunday: "Вс."
}

export function isEvenWeek(targetDate: Date): boolean {
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)

  const year = target.getMonth() < 8 ? target.getFullYear() - 1 : target.getFullYear()
  const sept1 = new Date(year, 8, 1)
  sept1.setHours(0, 0, 0, 0)

  const dayOfWeek = sept1.getDay()
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  const mondayOfFirstWeek = new Date(sept1)
  mondayOfFirstWeek.setDate(sept1.getDate() - diffToMonday)
  mondayOfFirstWeek.setHours(0, 0, 0, 0)

  const diffInMs = target.getTime() - mondayOfFirstWeek.getTime()
  const diffInDays = Math.round(diffInMs / 86400000)
  const weekNumber = Math.floor(diffInDays / 7) + 1

  return weekNumber % 2 === 0
}
