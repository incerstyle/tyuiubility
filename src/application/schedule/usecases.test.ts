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

  it("does not change active group if setActiveGroup targets unknown group", async () => {
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
      set: vi.fn().mockResolvedValue(undefined)
    }

    const useCases = createScheduleUseCases(store)

    await expect(useCases.setActiveGroup({ groupName: "ПИ-404" })).resolves.toEqual({ ok: true })
    expect(store.set).not.toHaveBeenCalled()
  })

  it("ignores toggleFavoriteGroup for unknown group", async () => {
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
      set: vi.fn().mockResolvedValue(undefined)
    }

    const useCases = createScheduleUseCases(store)

    await expect(useCases.toggleFavoriteGroup({ groupName: "ПИ-404" })).resolves.toEqual({ ok: true })
    expect(store.set).not.toHaveBeenCalled()
  })

  it("keeps active group when deleting non-active group", async () => {
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
        activeGroup: "ПИ-101"
      }),
      set: vi.fn().mockResolvedValue(undefined)
    }

    const useCases = createScheduleUseCases(store)

    await expect(useCases.deleteSchedule({ groupName: "ПИ-102" })).resolves.toEqual({ ok: true })
    expect(store.set).toHaveBeenCalledWith({
      schedulesByGroup: {
        "ПИ-101": {
          odd: createEmptyWeek(),
          even: createEmptyWeek(),
          savedAt: 100,
          isFavorite: true
        }
      },
      activeGroup: "ПИ-101"
    })
  })

  it("migrates legacy schedule fields and picks favorite as active", async () => {
    const legacyOdd = createEmptyWeek()
    const legacyEven = createEmptyWeek()

    const store: ScheduleStore = {
      get: vi.fn().mockResolvedValue({
        scheduleOdd: legacyOdd,
        scheduleEven: legacyEven,
        savedAt: 321
      }),
      set: vi.fn().mockResolvedValue(undefined)
    }

    const useCases = createScheduleUseCases(store)
    const result = await useCases.getSchedule()

    expect(result.activeGroup).toBe("Без названия")
    expect(result.schedulesByGroup?.["Без названия"]).toMatchObject({
      odd: legacyOdd,
      even: legacyEven,
      savedAt: 321,
      isFavorite: true
    })
  })

  it("preserves existing favorite flag on save for existing group", async () => {
    const store: ScheduleStore = {
      get: vi.fn().mockResolvedValue({
        schedulesByGroup: {
          "ПИ-101": {
            odd: createEmptyWeek(),
            even: createEmptyWeek(),
            savedAt: 100,
            isFavorite: true
          }
        },
        activeGroup: "ПИ-101"
      }),
      set: vi.fn().mockResolvedValue(undefined)
    }

    const useCases = createScheduleUseCases(store, () => 999)
    await useCases.saveSchedule({
      groupName: "ПИ-101",
      schedules: { odd: createEmptyWeek(), even: createEmptyWeek() }
    })

    expect(store.set).toHaveBeenCalledWith({
      schedulesByGroup: {
        "ПИ-101": {
          odd: createEmptyWeek(),
          even: createEmptyWeek(),
          savedAt: 999,
          isFavorite: true
        }
      },
      activeGroup: "ПИ-101"
    })
  })
})
