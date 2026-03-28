import browser from "webextension-polyfill";

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

type DeleteScheduleMessage = {
  type: "DELETE_SCHEDULE"
};

type IncomingMessage = SaveScheduleMessage | GetScheduleMessage | DeleteScheduleMessage

browser.runtime.onMessage.addListener((message: IncomingMessage) => {
    if (message.type === "SAVE_SCHEDULE") {
      return browser.storage.local.set({
        scheduleOdd: message.payload.odd,
        scheduleEven: message.payload.even,
        savedAt: Date.now()
      }).then(() => {
        return { ok: true };
      });
    }

    if (message.type === "GET_SCHEDULE") {
      return browser.storage.local.get([
        "scheduleOdd",
        "scheduleEven",
        "savedAt"
      ]).then((data) => {
      return data;
    });
  }

  if (message.type === "DELETE_SCHEDULE") {
    return browser.storage.local.remove([
      "scheduleOdd",
      "scheduleEven",
      "savedAt"
    ]).then(() => {
      return { ok: true };
    });
  }

  return Promise.resolve({});
});