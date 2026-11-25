import type { HistoryEntry } from '../types';

const HISTORY_KEY = 'symptosense_history_v1';
const OPT_IN_KEY = 'symptosense_history_opt_in_v1';

export function getHistoryOptIn(): boolean {
  try {
    return window.localStorage.getItem(OPT_IN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setHistoryOptIn(optedIn: boolean): void {
  try {
    if (optedIn) {
      window.localStorage.setItem(OPT_IN_KEY, 'true');
    } else {
      window.localStorage.removeItem(OPT_IN_KEY);
    }
  } catch {
    // Ignore storage quota or private mode failures
  }
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const existing = loadHistory();
  const next = [entry, ...existing.filter((item) => item.id !== entry.id)].slice(0, 30);
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota failures
  }
  return next;
}

export function clearAllHistoryData(): void {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
    window.localStorage.removeItem(OPT_IN_KEY);
  } catch {
    // Ignore storage failures
  }
}
