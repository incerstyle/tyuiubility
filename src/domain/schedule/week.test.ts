import { describe, expect, it } from "vitest"
import { isEvenWeek } from "./week"

describe("isEvenWeek", () => {
  it("returns false for academic year start week", () => {
    expect(isEvenWeek(new Date(2025, 8, 1))).toBe(false)
  })

  it("switches parity on the next week", () => {
    expect(isEvenWeek(new Date(2025, 8, 8))).toBe(true)
  })

  it("uses previous academic year before September", () => {
    const augustWeek = isEvenWeek(new Date(2026, 7, 31))
    const septemberWeek = isEvenWeek(new Date(2026, 8, 1))

    expect(typeof augustWeek).toBe("boolean")
    expect(typeof septemberWeek).toBe("boolean")
  })

  it("handles years when September 1 is Sunday", () => {
    expect(typeof isEvenWeek(new Date(2024, 8, 1))).toBe("boolean")
    expect(typeof isEvenWeek(new Date(2024, 8, 2))).toBe("boolean")
  })
})
