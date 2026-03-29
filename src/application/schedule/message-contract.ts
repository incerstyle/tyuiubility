import type { SchedulesPayload, StoredData } from "../../domain/schedule/types"

export const MESSAGE_TYPE = {
  saveSchedule: "SAVE_SCHEDULE",
  getSchedule: "GET_SCHEDULE",
  deleteSchedule: "DELETE_SCHEDULE"
} as const

export type SaveScheduleMessage = {
  type: typeof MESSAGE_TYPE.saveSchedule
  payload: SchedulesPayload
}

export type GetScheduleMessage = {
  type: typeof MESSAGE_TYPE.getSchedule
}

export type DeleteScheduleMessage = {
  type: typeof MESSAGE_TYPE.deleteSchedule
}

export type IncomingMessage =
  | SaveScheduleMessage
  | GetScheduleMessage
  | DeleteScheduleMessage

export type SaveScheduleResponse = {
  ok: true
}

export type DeleteScheduleResponse = {
  ok: true
}

export type MessageResponse =
  | StoredData
  | SaveScheduleResponse
  | DeleteScheduleResponse
  | Record<string, never>
