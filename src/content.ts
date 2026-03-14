import browser from "webextension-polyfill"
import saveScheduleImg from "url:~assets/save-schedule-button.png"

type Lesson = {
  time: string
  subject: string
  subGroup: string
  type: string
  location: string
  teacher: string
}

type DaySchedule = Lesson[]

type WeekSchedule = {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
}

type SchedulesPayload = {
  odd: WeekSchedule
  even: WeekSchedule
}

function parseTableByDay(table: HTMLElement): WeekSchedule {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ] as const

  const result: WeekSchedule = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: []
  }

  const cells = Array.from(
    table.querySelectorAll<HTMLElement>(".table-cell, .table-cell-event")
  ).filter((cell) => !cell.classList.contains("header"))

  let i = 0

  while (i < cells.length) {
    const timeCell = cells[i++]
    const time = timeCell.textContent.trim()

    for (let d = 0; d < 6; d++) {
      const cell = cells[i++]
      if (!cell) continue
      
      const lessonCells = cell.querySelectorAll<HTMLElement>(".event-body")

      for (const lessonCell of lessonCells) {

        const subject =
          lessonCell.querySelector(".font-bold")?.textContent?.trim() ?? ""

        const type =
          lessonCell.querySelector(".lesson-type")?.textContent?.trim() ?? ""

        const teacher =
          lessonCell.querySelector(String.raw`.mt-0\.5`)?.textContent?.trim() ??
          lessonCell.querySelector(".font-medium")?.textContent?.trim() ??
          ""

        const subgroup =
          lessonCell.querySelector(".title-subgroup")?.textContent?.trim() ??
          lessonCell.querySelector(".font-medium.mb-1")?.textContent?.trim() ??
          ""

        const locationBlock = lessonCell.querySelector(".flex-vc")
        let location = ""

        if (locationBlock) {
          const textNodes = Array.from(locationBlock.childNodes)
            .filter(n => n.nodeType === Node.TEXT_NODE)

          location = textNodes
            .map(n => n.textContent?.trim())
            .join(" ")
            .trim()
        }

        result[days[d]].push({
          time,
          subject,
          subGroup: subgroup,
          type,
          location,
          teacher
        })
      }
    }
  }

  return result
}

function getSchedulesByDay(): SchedulesPayload {
  const headers = document.querySelectorAll(
    ".my-typography.h3.justify-center"
  )

  let oddTable: HTMLElement | null = null
  let evenTable: HTMLElement | null = null

  headers.forEach((header) => {
    const title = header.textContent?.toLowerCase() ?? ""
    const wrapper = header.nextElementSibling
    const table = wrapper?.querySelector(".my-schedule-table") as HTMLElement | null
    if (!table) return

    if (title.includes("числитель") || title.includes("нечет")) {
      oddTable = table
    }

    if (title.includes("знаменатель") || title.includes("чет")) {
      evenTable = table
    }
  })

  return {
    odd: oddTable ? parseTableByDay(oddTable) : emptyWeek(),
    even: evenTable ? parseTableByDay(evenTable) : emptyWeek()
  }
}

function emptyWeek(): WeekSchedule {
  return {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: []
  }
}

function insertScheduleButton() {
  if (document.getElementById("save-schedule-btn")) return;

  const header = Array.from(document.querySelectorAll<HTMLDivElement>("div.my-typography.h1"))
    .find(el => el.textContent?.trim() === "Расписание");

  if (!header) return;


  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "8px";
  header.replaceWith(wrapper);
  wrapper.appendChild(header);

  const button = document.createElement("img");
  button.id = "save-schedule-btn";
  button.src = saveScheduleImg;
  button.alt = "Сохранить расписание";
  button.style.cursor = "pointer";
  button.style.width = "24px";
  button.style.height = "24px";
  button.style.marginBottom = "1.5rem";

  button.onmouseenter = () => {
    button.style.transform = "scale(1.12)";
  };
  button.onmouseleave = () => {
    button.style.transform = "scale(1)";
  };

  button.onmousedown = () => {
    button.style.transform = "scale(0.95)";
  };
  button.onmouseup = () => {
    button.style.transform = "scale(1.12)";
  };

  wrapper.appendChild(button);

  const tooltip = document.createElement("div");
  tooltip.style.position = "absolute";
  tooltip.style.padding = "6px 12px";
  tooltip.style.backgroundColor = "black";
  tooltip.style.color = "white";
  tooltip.style.borderRadius = "4px";
  tooltip.style.fontSize = "12px";
  tooltip.style.opacity = "0";
  tooltip.style.transition = "opacity 0.25s";
  tooltip.style.pointerEvents = "none";
  tooltip.style.zIndex = "9999";
  tooltip.textContent = "Сохранено!";
  document.body.appendChild(tooltip);

  button.onclick = () => {
    try {
      const schedules = getSchedulesByDay();
      browser.runtime.sendMessage({ type: "SAVE_SCHEDULE", payload: schedules });
      const rect = button.getBoundingClientRect();
      tooltip.style.top = `${rect.top - 30}px`;
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.opacity = "1";
      setTimeout(() => (tooltip.style.opacity = "0"), 1500);
    } catch (e) {
      console.error("Ошибка сохранения", e);
      tooltip.textContent = "Ошибка!";
      const rect = button.getBoundingClientRect();
      tooltip.style.top = `${rect.top - 30}px`;
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.opacity = "1";
      setTimeout(() => {
        tooltip.style.opacity = "0";
        tooltip.textContent = "Сохранено!";
      }, 1500);
    }
  };
}

const globalObserver = new MutationObserver(() => {
  if (!location.href.includes("my.tyuiu.ru/schedule")) return;
  insertScheduleButton();
});
globalObserver.observe(document.body, { childList: true, subtree: true });

insertScheduleButton();

(function () {
  const _pushState = history.pushState;
  history.pushState = function (...args) {
    _pushState.apply(this, args);
    insertScheduleButton();
  };
  const _replaceState = history.replaceState;
  history.replaceState = function (...args) {
    _replaceState.apply(this, args);
    insertScheduleButton();
  };
  globalThis.addEventListener("popstate", insertScheduleButton);
})();