import type {
  GroupSchedulesMap,
  SchedulesPayload,
  StoredData
} from "../../domain/schedule/types"
import type {
  DeleteScheduleResponse,
  SaveScheduleResponse,
  SetActiveGroupResponse,
  ToggleFavoriteGroupResponse
} from "./message-contract"

export type ScheduleStore = {
  get: () => Promise<StoredData>
  set: (data: StoredData) => Promise<void>
}

export type ScheduleUseCases = {
  saveSchedule: (payload: {
    groupName: string
    schedules: SchedulesPayload
  }) => Promise<SaveScheduleResponse>
  getSchedule: () => Promise<StoredData>
  deleteSchedule: (payload: { groupName: string }) => Promise<DeleteScheduleResponse>
  setActiveGroup: (payload: { groupName: string }) => Promise<SetActiveGroupResponse>
  toggleFavoriteGroup: (payload: {
    groupName: string
  }) => Promise<ToggleFavoriteGroupResponse>
}

const LEGACY_GROUP_NAME = "Без названия"

function getInitialActiveGroup(groups: GroupSchedulesMap): string | undefined {
  const favorite = Object.entries(groups).find(([, data]) => data.isFavorite)
  if (favorite) {
    return favorite[0]
  }

  return Object.keys(groups)[0]
}

function toGroupMap(data: StoredData): GroupSchedulesMap {
  if (data.schedulesByGroup) {
    return data.schedulesByGroup
  }

  if (data.scheduleOdd && data.scheduleEven) {
    return {
      [LEGACY_GROUP_NAME]: {
        odd: data.scheduleOdd,
        even: data.scheduleEven,
        savedAt: data.savedAt ?? Date.now(),
        isFavorite: true
      }
    }
  }

  return {}
}

function normalizeStoredData(data: StoredData): StoredData {
  const groups = toGroupMap(data)
  const activeGroup =
    data.activeGroup && groups[data.activeGroup]
      ? data.activeGroup
      : getInitialActiveGroup(groups)

  return {
    schedulesByGroup: groups,
    activeGroup
  }
}

function ensureSingleFavorite(groups: GroupSchedulesMap, targetGroupName: string) {
  for (const [groupName, groupData] of Object.entries(groups)) {
    groups[groupName] = {
      ...groupData,
      isFavorite: groupName === targetGroupName
    }
  }
}

export function createScheduleUseCases(
  store: ScheduleStore,
  now: () => number = () => Date.now()
): ScheduleUseCases {
  return {
    async saveSchedule(payload) {
      const data = normalizeStoredData(await store.get())
      const currentGroups = data.schedulesByGroup ?? {}
      const currentGroup = data.schedulesByGroup?.[payload.groupName]
      const nextGroups = {
        ...currentGroups,
        [payload.groupName]: {
          odd: payload.schedules.odd,
          even: payload.schedules.even,
          savedAt: now(),
          isFavorite: currentGroup?.isFavorite
        }
      }

      await store.set({
        schedulesByGroup: nextGroups,
        activeGroup: data.activeGroup ?? payload.groupName
      })

      return { ok: true }
    },

    async getSchedule() {
      return normalizeStoredData(await store.get())
    },

    async deleteSchedule(payload) {
      const data = normalizeStoredData(await store.get())
      const currentGroups = data.schedulesByGroup ?? {}
      const nextGroups = { ...currentGroups }
      delete nextGroups[payload.groupName]

      await store.set({
        schedulesByGroup: nextGroups,
        activeGroup:
          data.activeGroup === payload.groupName
            ? getInitialActiveGroup(nextGroups)
            : data.activeGroup
      })

      return { ok: true }
    },

    async setActiveGroup(payload) {
      const data = normalizeStoredData(await store.get())
      if (!data.schedulesByGroup?.[payload.groupName]) {
        return { ok: true }
      }

      await store.set({
        schedulesByGroup: data.schedulesByGroup,
        activeGroup: payload.groupName
      })

      return { ok: true }
    },

    async toggleFavoriteGroup(payload) {
      const data = normalizeStoredData(await store.get())
      const currentGroups = data.schedulesByGroup ?? {}
      const groups = { ...currentGroups }
      if (!groups[payload.groupName]) {
        return { ok: true }
      }

      // Favorite is unique and cannot be unset to "none".
      ensureSingleFavorite(groups, payload.groupName)

      await store.set({
        schedulesByGroup: groups,
        activeGroup: data.activeGroup
      })

      return { ok: true }
    }
  }
}
