/**
 * Duration Formatting Utility
 *
 * Centralized duration formatting for consistent display across the app.
 */

/**
 * Format duration in minutes to human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "45m", "1h 30m", "2h")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

/**
 * Format duration with full words
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "45 minutes", "1 hour 30 minutes")
 */
export function formatDurationLong(minutes: number): string {
  if (minutes < 60) {
    return minutes === 1 ? "1 minute" : `${minutes} minutes`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const hoursStr = hours === 1 ? "1 hour" : `${hours} hours`
  if (mins === 0) return hoursStr
  const minsStr = mins === 1 ? "1 minute" : `${mins} minutes`
  return `${hoursStr} ${minsStr}`
}

/**
 * Format seconds to mm:ss display
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "5:03", "12:45")
 */
export function formatSecondsAsTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
