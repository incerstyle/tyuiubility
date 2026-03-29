import { MESSAGE_TYPE, type IncomingMessage, type MessageResponse } from "./message-contract"
import type { ScheduleUseCases } from "./usecases"

export function createScheduleMessageHandler(useCases: ScheduleUseCases) {
  return async (message: IncomingMessage): Promise<MessageResponse> => {
    if (message.type === MESSAGE_TYPE.saveSchedule) {
      return useCases.saveSchedule(message.payload)
    }

    if (message.type === MESSAGE_TYPE.getSchedule) {
      return useCases.getSchedule()
    }

    if (message.type === MESSAGE_TYPE.deleteSchedule) {
      return useCases.deleteSchedule()
    }

    return {}
  }
}
