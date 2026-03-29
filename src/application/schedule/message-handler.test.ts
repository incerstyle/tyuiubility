import { describe, expect, it, vi } from "vitest"
import { createEmptyWeek } from "../../domain/schedule/types"
import { createScheduleMessageHandler } from "./message-handler"
import { MESSAGE_TYPE } from "./message-contract"

describe("createScheduleMessageHandler", () => {
  it("routes SAVE_SCHEDULE to save use case", async () => {
    const useCases = {
      saveSchedule: vi.fn().mockResolvedValue({ ok: true }),
      getSchedule: vi.fn(),
      deleteSchedule: vi.fn(),
      setActiveGroup: vi.fn(),
      toggleFavoriteGroup: vi.fn()
    }

    const handler = createScheduleMessageHandler(useCases)
    const payload = {
      groupName: "ПИ-101",
      schedules: { odd: createEmptyWeek(), even: createEmptyWeek() }
    }

    await expect(
      handler({ type: MESSAGE_TYPE.saveSchedule, payload })
    ).resolves.toEqual({ ok: true })

    expect(useCases.saveSchedule).toHaveBeenCalledWith(payload)
  })

  it("routes GET_SCHEDULE to get use case", async () => {
    const response = { savedAt: 1 }
    const useCases = {
      saveSchedule: vi.fn(),
      getSchedule: vi.fn().mockResolvedValue(response),
      deleteSchedule: vi.fn(),
      setActiveGroup: vi.fn(),
      toggleFavoriteGroup: vi.fn()
    }

    const handler = createScheduleMessageHandler(useCases)

    await expect(handler({ type: MESSAGE_TYPE.getSchedule })).resolves.toEqual(response)
    expect(useCases.getSchedule).toHaveBeenCalledTimes(1)
  })

  it("routes DELETE_SCHEDULE to delete use case", async () => {
    const useCases = {
      saveSchedule: vi.fn(),
      getSchedule: vi.fn(),
      deleteSchedule: vi.fn().mockResolvedValue({ ok: true }),
      setActiveGroup: vi.fn(),
      toggleFavoriteGroup: vi.fn()
    }

    const handler = createScheduleMessageHandler(useCases)

    await expect(
      handler({ type: MESSAGE_TYPE.deleteSchedule, payload: { groupName: "ПИ-101" } })
    ).resolves.toEqual({ ok: true })
    expect(useCases.deleteSchedule).toHaveBeenCalledWith({ groupName: "ПИ-101" })
  })

  it("routes SET_ACTIVE_GROUP to setActiveGroup use case", async () => {
    const useCases = {
      saveSchedule: vi.fn(),
      getSchedule: vi.fn(),
      deleteSchedule: vi.fn(),
      setActiveGroup: vi.fn().mockResolvedValue({ ok: true }),
      toggleFavoriteGroup: vi.fn()
    }

    const handler = createScheduleMessageHandler(useCases)

    await expect(
      handler({ type: MESSAGE_TYPE.setActiveGroup, payload: { groupName: "ПИ-101" } })
    ).resolves.toEqual({ ok: true })
    expect(useCases.setActiveGroup).toHaveBeenCalledWith({ groupName: "ПИ-101" })
  })

  it("routes TOGGLE_FAVORITE_GROUP to toggleFavoriteGroup use case", async () => {
    const useCases = {
      saveSchedule: vi.fn(),
      getSchedule: vi.fn(),
      deleteSchedule: vi.fn(),
      setActiveGroup: vi.fn(),
      toggleFavoriteGroup: vi.fn().mockResolvedValue({ ok: true })
    }

    const handler = createScheduleMessageHandler(useCases)

    await expect(
      handler({ type: MESSAGE_TYPE.toggleFavoriteGroup, payload: { groupName: "ПИ-101" } })
    ).resolves.toEqual({ ok: true })
    expect(useCases.toggleFavoriteGroup).toHaveBeenCalledWith({ groupName: "ПИ-101" })
  })
})
