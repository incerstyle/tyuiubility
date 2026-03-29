import { describe, expect, it } from "vitest"
import { parseTableByDay } from "./parser"

function buildTableHtml(): string {
  return `
    <div class="my-schedule-table">
      <div class="table-cell header">time</div>
      <div class="table-cell header">mon</div>
      <div class="table-cell header">tue</div>
      <div class="table-cell header">wed</div>
      <div class="table-cell header">thu</div>
      <div class="table-cell header">fri</div>
      <div class="table-cell header">sat</div>

      <div class="table-cell">08:00-09:30</div>

      <div class="table-cell-event">
        <div class="event-body">
          <div class="font-bold">Математика</div>
          <div class="lesson-type">Лекция</div>
          <div class="mt-0.5">Иванов И.И.</div>
          <div class="title-subgroup">1 подгруппа</div>
          <div class="flex-vc">ауд. 101</div>
        </div>
      </div>

      <div class="table-cell-event"></div>

      <div class="table-cell-event">
        <div class="event-body">
          <div class="font-bold">Физика</div>
          <div class="lesson-type">Практика</div>
          <div class="font-medium">Петров П.П.</div>
          <div class="font-medium mb-1">2 подгруппа</div>
          <div class="flex-vc">
            корп. Б
            <span>icon</span>
            каб. 202
          </div>
        </div>
      </div>

      <div class="table-cell-event"></div>
      <div class="table-cell-event"></div>
      <div class="table-cell-event"></div>
    </div>
  `
}

describe("parseTableByDay", () => {
  it("parses lessons by weekdays and keeps sunday empty", () => {
    document.body.innerHTML = buildTableHtml()
    const table = document.querySelector<HTMLElement>(".my-schedule-table")

    const week = parseTableByDay(table)

    expect(week.monday).toHaveLength(1)
    expect(week.monday[0]).toMatchObject({
      time: "08:00-09:30",
      subject: "Математика",
      type: "Лекция",
      teacher: "Иванов И.И.",
      subGroup: "1 подгруппа",
      location: "ауд. 101"
    })

    expect(week.wednesday).toHaveLength(1)
    expect(week.wednesday[0]).toMatchObject({
      subject: "Физика",
      teacher: "Петров П.П.",
      subGroup: "2 подгруппа"
    })

    expect(week.tuesday).toHaveLength(0)
    expect(week.sunday).toHaveLength(0)
  })
})
