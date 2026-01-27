import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  parseISO,
  isToday,
  isSameWeek,
  isSameMonth,
  startOfMonth,
} from 'date-fns'
import { ja } from 'date-fns/locale'

// Format: YYYY-MM-DD
export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

// Format: YYYY-MM
export function formatMonth(date: Date): string {
  return format(date, 'yyyy-MM')
}

// Get Monday of the week (week starts on Monday)
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

// Get Sunday of the week
export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 })
}

// Get all dates in a week
export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

// Parse date string to Date
export function parseDate(dateStr: string): Date {
  return parseISO(dateStr)
}

// Japanese day names (short)
export const DAY_NAMES_JA = ['月', '火', '水', '木', '金', '土', '日']

// Get Japanese day name
export function getDayNameJa(dayOfWeek: number): string {
  return DAY_NAMES_JA[dayOfWeek]
}

// Format date in Japanese
export function formatDateJa(date: Date, pattern: string = 'M月d日(E)'): string {
  return format(date, pattern, { locale: ja })
}

// Check if date is today
export function isDateToday(dateStr: string): boolean {
  return isToday(parseISO(dateStr))
}

// Check if date is in current week
export function isDateInCurrentWeek(dateStr: string): boolean {
  return isSameWeek(parseISO(dateStr), new Date(), { weekStartsOn: 1 })
}

// Check if date is in current month
export function isDateInCurrentMonth(dateStr: string): boolean {
  return isSameMonth(parseISO(dateStr), new Date())
}

// Get today's date string
export function getTodayStr(): string {
  return formatDate(new Date())
}

// Get current week start string
export function getCurrentWeekStartStr(): string {
  return formatDate(getWeekStart(new Date()))
}

// Get current month string
export function getCurrentMonthStr(): string {
  return formatMonth(new Date())
}

// Get first day of current month
export function getMonthStartStr(): string {
  return formatDate(startOfMonth(new Date()))
}
