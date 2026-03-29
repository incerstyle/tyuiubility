export type Lesson = {
  time: string
  subject: string
  subGroup: string
  type: string
  location: string
  teacher: string
}

export type DaySchedule = Lesson[]

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export type WeekSchedule = Record<Weekday, DaySchedule>

export type SchedulesPayload = {
  odd: WeekSchedule
  even: WeekSchedule
}

export type StoredData = {
  scheduleOdd?: WeekSchedule
  scheduleEven?: WeekSchedule
  savedAt?: number
}

export function createEmptyWeek(): WeekSchedule {
  return {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  }
}
