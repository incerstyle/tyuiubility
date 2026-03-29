import { useEffect, useState } from "react"
import browser from "webextension-polyfill"
import backButtonImg from "url:~assets/back-button.png"
import trashIcon from "url:~assets/trash.png"
import { MESSAGE_TYPE } from "~src/application/schedule/message-contract"
import type { GroupSchedulesMap, StoredData } from "~src/domain/schedule/types"

interface SettingsScreenProps {
  onBack: () => void
  selectedGroupName: string | null
  onSelectGroupChange: (groupName: string | null) => void
}

function getFavoriteGroupName(groups: GroupSchedulesMap): string | null {
  const favorite = Object.entries(groups).find(([, groupData]) => groupData.isFavorite)
  return favorite ? favorite[0] : null
}

function resolveGroupSelection(
  groups: GroupSchedulesMap,
  preferredGroupName: string | null
): string | null {
  if (preferredGroupName && groups[preferredGroupName]) {
    return preferredGroupName
  }

  const favorite = getFavoriteGroupName(groups)
  if (favorite) {
    return favorite
  }

  return Object.keys(groups)[0] ?? null
}

export default function SettingsScreen({
  onBack,
  selectedGroupName,
  onSelectGroupChange
}: Readonly<SettingsScreenProps>) {
  const [groups, setGroups] = useState<GroupSchedulesMap>({})
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [isScheduleSettingsOpen, setIsScheduleSettingsOpen] = useState(true)

  async function loadSchedules(preferredGroupName: string | null = selectedGroupName) {
    const data = (await browser.runtime.sendMessage({
      type: MESSAGE_TYPE.getSchedule
    })) as StoredData

    const nextGroups = data.schedulesByGroup ?? {}
    const nextSelectedGroup = resolveGroupSelection(nextGroups, preferredGroupName)
    setGroups(nextGroups)
    setActiveGroup(nextSelectedGroup)
    onSelectGroupChange(nextSelectedGroup)
  }

  useEffect(() => {
    loadSchedules().catch((err) => {
      console.error("Ошибка загрузки расписаний:", err)
    })
  }, [onSelectGroupChange, selectedGroupName])

  async function onSelectGroup(groupName: string) {
    await browser.runtime.sendMessage({
      type: MESSAGE_TYPE.setActiveGroup,
      payload: { groupName }
    })
    setActiveGroup(groupName)
    onSelectGroupChange(groupName)
  }

  async function onDeleteGroup(groupName: string) {
    await browser.runtime.sendMessage({
      type: MESSAGE_TYPE.deleteSchedule,
      payload: { groupName }
    })
    await loadSchedules(activeGroup === groupName ? null : activeGroup)
  }

  async function onToggleFavorite(groupName: string) {
    await browser.runtime.sendMessage({
      type: MESSAGE_TYPE.toggleFavoriteGroup,
      payload: { groupName }
    })
    await loadSchedules(activeGroup)
  }

  return (
    <div className="settings-container">

      <header className="settings-header">
        <button onClick={onBack} className="nav-button">
          <img src={backButtonImg} alt="Назад"/>
        </button>

        <h1 className="settings-page-title">Настройки</h1>
      </header>

      <div className="settings-card">
        <button
          className="settings-row settings-row-title settings-section-toggle"
          onClick={() => {
            setIsScheduleSettingsOpen((value) => !value)
          }}>
          <span className="settings-label">Настройки расписания</span>
          <span className="settings-value">{isScheduleSettingsOpen ? "▾" : "▸"}</span>
        </button>

        {isScheduleSettingsOpen ? (
          <>
            {Object.keys(groups).length === 0 ? (
              <div className="settings-row settings-empty">Пока нет сохраненных расписаний</div>
            ) : (
              Object.entries(groups).map(([groupName, groupData]) => (
                <div
                  key={groupName}
                  className={`settings-group-row ${activeGroup === groupName ? "active" : ""}`}>
                  <button
                    className="settings-group-select"
                    onClick={() => {
                      onSelectGroup(groupName).catch((err) => {
                        console.error("Ошибка выбора группы:", err)
                      })
                    }}>
                    <span className="settings-group-name">
                      {groupName}
                      {groupData.isFavorite ? (
                        <span className="settings-favorite-mark" title="Избранная группа"> ★</span>
                      ) : null}
                    </span>
                  </button>

                  <span className="settings-group-actions">
                    <button
                      className={`settings-icon-button ${groupData.isFavorite ? "favorite" : ""}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        onToggleFavorite(groupName).catch((err) => {
                          console.error("Ошибка обновления избранной группы:", err)
                        })
                      }}
                      aria-label="Отметить как избранную группу"
                      title="Избранная группа">
                      {groupData.isFavorite ? "★" : "☆"}
                    </button>

                    <button
                      className="settings-icon-button danger"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDeleteGroup(groupName).catch((err) => {
                          console.error("Ошибка удаления группы:", err)
                        })
                      }}
                      aria-label="Удалить расписание группы"
                      title="Удалить">
                      <img src={trashIcon} alt="Удалить" className="settings-trash-icon"/>
                    </button>
                  </span>
                </div>
              ))
            )}
          </>
        ) : null}

        <div className="settings-row">
          <span className="settings-label">Версия приложения</span>
          <span className="settings-value">1.0.5</span>
        </div>

      </div>

    </div>
  )
}