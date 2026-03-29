import browser from "webextension-polyfill"
import { createScheduleMessageHandler } from "~src/application/schedule/message-handler"
import { createScheduleUseCases } from "~src/application/schedule/usecases"
import type { SchedulesPayload } from "~src/domain/schedule/types"

const store = {
  async save(payload: SchedulesPayload, savedAt: number) {
    await browser.storage.local.set({
      scheduleOdd: payload.odd,
      scheduleEven: payload.even,
      savedAt
    })
  },

  async get() {
    return browser.storage.local.get(["scheduleOdd", "scheduleEven", "savedAt"])
  },

  async clear() {
    await browser.storage.local.remove(["scheduleOdd", "scheduleEven", "savedAt"])
  }
}

const handleMessage = createScheduleMessageHandler(createScheduleUseCases(store))

browser.runtime.onMessage.addListener(handleMessage)