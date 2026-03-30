import { createEmptyWeek, type Weekday, type WeekSchedule } from "./types"

const TABLE_WEEK_DAYS: Exclude<Weekday, "sunday">[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
]

export function parseTableByDay(table: HTMLElement): WeekSchedule {
  const result = createEmptyWeek()

  const cells = Array.from(
    table.querySelectorAll<HTMLElement>(".table-cell, .table-cell-event")
  ).filter((cell) => !cell.classList.contains("header"))

  let i = 0

  while (i < cells.length) {
    const timeCell = cells[i++]
    if (!timeCell) {
      continue
    }

    const time = timeCell.textContent?.trim() ?? ""

    for (const day of TABLE_WEEK_DAYS) {
      const cell = cells[i++]
      if (!cell) {
        continue
      }

      const lessonCells = cell.querySelectorAll<HTMLElement>(".event-body")

      for (const lessonCell of lessonCells) {
        const subject = lessonCell.querySelector(".font-bold")?.textContent?.trim() ?? ""
        const type = lessonCell.querySelector(".lesson-type")?.textContent?.trim() ?? ""

        const teacher =
          lessonCell.querySelector(String.raw`.mt-0\.5`)?.textContent?.trim() ??
          lessonCell.querySelector(".font-medium")?.textContent?.trim() ??
          ""

        const subGroup =
          lessonCell.querySelector(".title-subgroup")?.textContent?.trim() ??
          lessonCell.querySelector(".font-medium.mb-1")?.textContent?.trim() ??
          ""

        const groupElement = Array.from(lessonCell.querySelectorAll("div")).find(div => {
          if (div.children.length > 0) return false;
          const text = div.textContent?.trim() || "";

          return /^[А-Яа-яA-Za-z]+-\d+-\d+$/.test(text);
        });
        const group = groupElement?.textContent?.trim() || "";

        const locationBlock = lessonCell.querySelector(".flex-vc")
        let location = ""

        if (locationBlock) {
          const textNodes = Array.from(locationBlock.childNodes).filter(
            (node) => node.nodeType === Node.TEXT_NODE
          )

          location = textNodes
            .map((node) => node.textContent?.trim())
            .join(" ")
            .trim()
        }

        result[day].push({
          time,
          group,
          subject,
          subGroup,
          type,
          location,
          teacher
        })
      }
    }
  }

  return result
}
