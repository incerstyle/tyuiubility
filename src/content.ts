import browser from "webextension-polyfill"
import saveScheduleImg from "url:~assets/save-schedule-button.png"
import { MESSAGE_TYPE } from "~src/application/schedule/message-contract"
import { parseTableByDay } from "~src/domain/schedule/parser"
import { createEmptyWeek, type SchedulesPayload } from "~src/domain/schedule/types"

const DEFAULT_GROUP_NAME = "Без названия"

function getSchedulesByDay(): SchedulesPayload {
  const headers = document.querySelectorAll(
    ".my-typography.h3.justify-center"
  )

  let oddTable: HTMLElement | null = null
  let evenTable: HTMLElement | null = null

  headers.forEach((header) => {
    const title = header.textContent?.toLowerCase() ?? ""
    const wrapper = header.nextElementSibling
    const table = wrapper?.querySelector<HTMLElement>(".my-schedule-table")
    if (!table) return

    if (title.includes("числитель") || title.includes("нечет")) {
      oddTable = table
    }

    if (title.includes("знаменатель") || title.includes("чет")) {
      evenTable = table
    }
  })

  return {
    odd: oddTable ? parseTableByDay(oddTable) : createEmptyWeek(),
    even: evenTable ? parseTableByDay(evenTable) : createEmptyWeek()
  }
}

function getCurrentGroupName(): string {
  const selectedGroup = document
    .querySelector(".magic-selected .selected-value span")
    ?.textContent?.trim()

  return selectedGroup || DEFAULT_GROUP_NAME
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
      const groupName = getCurrentGroupName();

      browser.runtime.sendMessage({
        type: MESSAGE_TYPE.saveSchedule,
        payload: {
          groupName,
          schedules
        }
      });
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