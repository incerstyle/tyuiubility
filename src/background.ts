import browser from "webextension-polyfill"
import { createScheduleMessageHandler } from "~src/application/schedule/message-handler"
import { createScheduleUseCases } from "~src/application/schedule/usecases"
import type { StoredData } from "~src/domain/schedule/types"

const store = {
  async get() {
    return browser.storage.local.get([
      "schedulesByGroup",
      "activeGroup",
      "scheduleOdd",
      "scheduleEven",
      "savedAt"
    ])
  },

  async set(data: StoredData) {
    await browser.storage.local.set({
      schedulesByGroup: data.schedulesByGroup ?? {},
      activeGroup: data.activeGroup
    })

    // Remove legacy keys after writing grouped format.
    await browser.storage.local.remove(["scheduleOdd", "scheduleEven", "savedAt"])
  }
}

const handleMessage = createScheduleMessageHandler(createScheduleUseCases(store))

browser.runtime.onMessage.addListener(handleMessage)