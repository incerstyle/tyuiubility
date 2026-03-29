import type { SchedulesPayload, StoredData } from "../../domain/schedule/types"
import type { DeleteScheduleResponse, SaveScheduleResponse } from "./message-contract"

export type ScheduleStore = {
  save: (payload: SchedulesPayload, savedAt: number) => Promise<void>
  get: () => Promise<StoredData>
  clear: () => Promise<void>
}

export type ScheduleUseCases = {
  saveSchedule: (payload: SchedulesPayload) => Promise<SaveScheduleResponse>
  getSchedule: () => Promise<StoredData>
  deleteSchedule: () => Promise<DeleteScheduleResponse>
}

export function createScheduleUseCases(
  store: ScheduleStore,
  now: () => number = () => Date.now()
): ScheduleUseCases {
  return {
    async saveSchedule(payload) {
      await store.save(payload, now())
      return { ok: true }
    },

    async getSchedule() {
      return store.get()
    },

    async deleteSchedule() {
      await store.clear()
      return { ok: true }
    }
  }
}
