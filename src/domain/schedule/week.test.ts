import { describe, expect, it } from "vitest"
import { isEvenWeek } from "./week"

describe("isEvenWeek", () => {
  it("returns false for academic year start week", () => {
    expect(isEvenWeek(new Date(2025, 8, 1))).toBe(false)
  })

  it("switches parity on the next week", () => {
    expect(isEvenWeek(new Date(2025, 8, 8))).toBe(true)
  })
})
