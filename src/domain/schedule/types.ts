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

export type GroupSchedule = SchedulesPayload & {
  savedAt: number
  isFavorite?: boolean
}

export type GroupSchedulesMap = Record<string, GroupSchedule>

export type StoredData = {
  schedulesByGroup?: GroupSchedulesMap
  activeGroup?: string

  // Legacy single-schedule fields for migration.
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
