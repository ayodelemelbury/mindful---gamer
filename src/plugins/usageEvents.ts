/**
 * UsageEvents Plugin - TypeScript definitions
 * 
 * Exposes Android's UsageStatsManager.queryEvents() API for real-time
 * foreground app detection.
 */

import { registerPlugin } from "@capacitor/core"

export interface UsageEvent {
  packageName: string
  className: string | null
  /** 1 = MOVE_TO_FOREGROUND, 2 = MOVE_TO_BACKGROUND */
  eventType: number
  timestamp: number
}

export interface QueryEventsOptions {
  beginTime: number
  endTime: number
}

export interface QueryEventsResult {
  events: UsageEvent[]
}

export interface CurrentForegroundResult {
  packageName: string | null
  timestamp: number | null
}

export interface AppDisplayInfo {
  packageName: string
  displayName: string
  category: number
}

export interface GetAppDisplayNamesResult {
  apps: AppDisplayInfo[]
}

export interface UsageEventsPluginInterface {
  queryEvents(options: QueryEventsOptions): Promise<QueryEventsResult>
  getCurrentForegroundApp(): Promise<CurrentForegroundResult>
  getAppDisplayNames(options: { packageNames: string[] }): Promise<GetAppDisplayNamesResult>
}

export const UsageEventsPlugin = registerPlugin<UsageEventsPluginInterface>(
  "UsageEventsPlugin"
)
