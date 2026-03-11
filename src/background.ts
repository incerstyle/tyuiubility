import browser from "webextension-polyfill";

// Типы сообщений
type SaveScheduleMessage = {
  type: "SAVE_SCHEDULE"
  payload: {
    odd: any
    even: any
  }
};

type GetScheduleMessage = {
  type: "GET_SCHEDULE"
};

type IncomingMessage = SaveScheduleMessage | GetScheduleMessage

// Background listener
chrome.runtime.onMessage.addListener(
  async (message: IncomingMessage) => {
    // Сохранение расписания
    if (message.type === "SAVE_SCHEDULE") {
      browser.storage.local.set({
        scheduleOdd: message.payload.odd,
        scheduleEven: message.payload.even,
        savedAt: Date.now()
      })

      return { ok: true }
    }

    // Получение расписания
    if (message.type === "GET_SCHEDULE") {
      const data = browser.storage.local.get([
        "scheduleOdd",
        "scheduleEven",
        "savedAt"
      ])

      return data
    }

    return {}
  }
);