import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a timestamp to a human-readable relative time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string (e.g., "Just now", "5 min ago", "2 hours ago")
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diffMs = now - timestamp

  // Guard for future timestamps (clock skew, etc.)
  if (diffMs < 0) {
    return "Just now"
  }

  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return "Just now"
  } else if (diffMinutes < 60) {
    return `${diffMinutes} min ago`
  } else if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`
  } else if (diffDays === 1) {
    return "Yesterday"
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    // Format as date for older entries
    const date = new Date(timestamp)
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  }
}

/**
 * Format a Date object to relative time string
 * @param date - Date object
 * @returns Relative time string
 */
export function formatDistanceToNow(date: Date): string {
  return formatTimeAgo(date.getTime())
}
