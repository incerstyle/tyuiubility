import { describe, expect, it, vi } from "vitest"
import { createEmptyWeek } from "../../domain/schedule/types"
import { createScheduleUseCases, type ScheduleStore } from "./usecases"

describe("createScheduleUseCases", () => {
  it("saves schedule with provided timestamp", async () => {
    const store: ScheduleStore = {
      save: vi.fn().mockResolvedValue(undefined),
      get: vi.fn(),
      clear: vi.fn()
    }

    const useCases = createScheduleUseCases(store, () => 123)
    const payload = { odd: createEmptyWeek(), even: createEmptyWeek() }

    const response = await useCases.saveSchedule(payload)

    expect(response).toEqual({ ok: true })
    expect(store.save).toHaveBeenCalledWith(payload, 123)
  })

  it("returns schedule from store", async () => {
    const storedData = {
      scheduleOdd: createEmptyWeek(),
      scheduleEven: createEmptyWeek(),
      savedAt: 100
    }

    const store: ScheduleStore = {
      save: vi.fn(),
      get: vi.fn().mockResolvedValue(storedData),
      clear: vi.fn()
    }

    const useCases = createScheduleUseCases(store)

    await expect(useCases.getSchedule()).resolves.toEqual(storedData)
  })

  it("clears schedule", async () => {
    const store: ScheduleStore = {
      save: vi.fn(),
      get: vi.fn(),
      clear: vi.fn().mockResolvedValue(undefined)
    }

    const useCases = createScheduleUseCases(store)

    await expect(useCases.deleteSchedule()).resolves.toEqual({ ok: true })
    expect(store.clear).toHaveBeenCalledTimes(1)
  })
})
