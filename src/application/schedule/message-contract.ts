import type { SchedulesPayload, StoredData } from "../../domain/schedule/types"

export const MESSAGE_TYPE = {
  saveSchedule: "SAVE_SCHEDULE",
  getSchedule: "GET_SCHEDULE",
  deleteSchedule: "DELETE_SCHEDULE",
  setActiveGroup: "SET_ACTIVE_GROUP",
  toggleFavoriteGroup: "TOGGLE_FAVORITE_GROUP"
} as const

export type SaveScheduleMessage = {
  type: typeof MESSAGE_TYPE.saveSchedule
  payload: {
    groupName: string
    schedules: SchedulesPayload
  }
}

export type GetScheduleMessage = {
  type: typeof MESSAGE_TYPE.getSchedule
}

export type DeleteScheduleMessage = {
  type: typeof MESSAGE_TYPE.deleteSchedule
  payload: {
    groupName: string
  }
}

export type SetActiveGroupMessage = {
  type: typeof MESSAGE_TYPE.setActiveGroup
  payload: {
    groupName: string
  }
}

export type ToggleFavoriteGroupMessage = {
  type: typeof MESSAGE_TYPE.toggleFavoriteGroup
  payload: {
    groupName: string
  }
}

export type IncomingMessage =
  | SaveScheduleMessage
  | GetScheduleMessage
  | DeleteScheduleMessage
  | SetActiveGroupMessage
  | ToggleFavoriteGroupMessage

export type SaveScheduleResponse = {
  ok: true
}

export type DeleteScheduleResponse = {
  ok: true
}

export type SetActiveGroupResponse = {
  ok: true
}

export type ToggleFavoriteGroupResponse = {
  ok: true
}

export type MessageResponse =
  | StoredData
  | SaveScheduleResponse
  | DeleteScheduleResponse
  | SetActiveGroupResponse
  | ToggleFavoriteGroupResponse
  | Record<string, never>
