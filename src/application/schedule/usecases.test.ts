import { describe, expect, it, vi } from "vitest"
import { createEmptyWeek } from "../../domain/schedule/types"
import { createScheduleUseCases, type ScheduleStore } from "./usecases"

describe("createScheduleUseCases", () => {
  it("saves schedule for a group with provided timestamp", async () => {
    const store: ScheduleStore = {
      get: vi.fn().mockResolvedValue({ schedulesByGroup: {}, activeGroup: undefined }),
      set: vi.fn().mockResolvedValue(undefined)
    }

    const useCases = createScheduleUseCases(store, () => 123)
    const payload = { odd: createEmptyWeek(), even: createEmptyWeek() }

    const response = await useCases.saveSchedule({ groupName: "ПИ-101", schedules: payload })

    expect(response).toEqual({ ok: true })
    expect(store.set).toHaveBeenCalledWith({
      schedulesByGroup: {
        "ПИ-101": {
          odd: payload.odd,
          even: payload.even,
          savedAt: 123,
          isFavorite: undefined
        }
      },
      activeGroup: "ПИ-101"
    })
  })

  it("returns normalized grouped schedule from store", async () => {
    const storedData = {
      schedulesByGroup: {
        "ПИ-101": {
          odd: createEmptyWeek(),
          even: createEmptyWeek(),
          savedAt: 100,
          isFavorite: true
        }
      },
      activeGroup: "ПИ-101"
    }

    const store: ScheduleStore = {
      get: vi.fn().mockResolvedValue(storedData),
      set: vi.fn()
    }

    const useCases = createScheduleUseCases(store)

    await expect(useCases.getSchedule()).resolves.toEqual(storedData)
  })

  it("deletes selected group", async () => {
    const store: ScheduleStore = {
      get: vi.fn().mockResolvedValue({
        schedulesByGroup: {
          "ПИ-101": {
            odd: createEmptyWeek(),
            even: createEmptyWeek(),
            savedAt: 100
          },
          "ПИ-102": {
            odd: createEmptyWeek(),
            even: createEmptyWeek(),
            savedAt: 200
          }
        },
        activeGroup: "ПИ-101"
      }),
      set: vi.fn().mockResolvedValue(undefined)
    }

    const useCases = createScheduleUseCases(store)

    await expect(useCases.deleteSchedule({ groupName: "ПИ-101" })).resolves.toEqual({ ok: true })
    expect(store.set).toHaveBeenCalledWith({
      schedulesByGroup: {
        "ПИ-102": {
          odd: createEmptyWeek(),
          even: createEmptyWeek(),
          savedAt: 200
        }
      },
      activeGroup: "ПИ-102"
    })
  })

  it("sets exactly one favorite group", async () => {
    const store: ScheduleStore = {
      get: vi.fn().mockResolvedValue({
        schedulesByGroup: {
          "ПИ-101": {
            odd: createEmptyWeek(),
            even: createEmptyWeek(),
            savedAt: 100,
            isFavorite: true
          },
          "ПИ-102": {
            odd: createEmptyWeek(),
            even: createEmptyWeek(),
            savedAt: 200,
            isFavorite: false
          }
        },
        activeGroup: "ПИ-102"
      }),
      set: vi.fn().mockResolvedValue(undefined)
    }

    const useCases = createScheduleUseCases(store)

    await expect(useCases.toggleFavoriteGroup({ groupName: "ПИ-102" })).resolves.toEqual({ ok: true })
    expect(store.set).toHaveBeenCalledWith({
      schedulesByGroup: {
        "ПИ-101": {
          odd: createEmptyWeek(),
          even: createEmptyWeek(),
          savedAt: 100,
          isFavorite: false
        },
        "ПИ-102": {
          odd: createEmptyWeek(),
          even: createEmptyWeek(),
          savedAt: 200,
          isFavorite: true
        }
      },
      activeGroup: "ПИ-102"
    })
  })
})
