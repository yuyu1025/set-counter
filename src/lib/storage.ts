import { LOCALE_STORAGE_KEY } from "@/lib/locale-boot";
import type { LoggedSet, Locale, WorkoutMode } from "@/lib/types";

export const STATE_STORAGE_KEY = "sets.state.v1";

export type PersistedState = {
  version: 1;
  exercise: string;
  reps: number;
  durationSec: number;
  mode: WorkoutMode;
  todayDate: string;
  today: LoggedSet[];
};

function isWorkoutMode(value: unknown): value is WorkoutMode {
  return value === "reps" || value === "timed";
}

function isLoggedSet(value: unknown): value is LoggedSet {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.exercise === "string" &&
    isWorkoutMode(record.mode) &&
    typeof record.reps === "number" &&
    Number.isFinite(record.reps) &&
    typeof record.durationSec === "number" &&
    Number.isFinite(record.durationSec) &&
    typeof record.at === "number" &&
    Number.isFinite(record.at)
  );
}

export function localDateKey(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function defaultState(): PersistedState {
  return {
    version: 1,
    exercise: "",
    reps: 10,
    durationSec: 90,
    mode: "reps",
    todayDate: localDateKey(),
    today: [],
  };
}

export function readState(): PersistedState {
  const fallback = defaultState();
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(STATE_STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return fallback;
    }
    const record = parsed as Record<string, unknown>;
    if (record.version !== 1) {
      return fallback;
    }
    const today = Array.isArray(record.today)
      ? record.today.filter(isLoggedSet)
      : [];
    const todayDate =
      typeof record.todayDate === "string" ? record.todayDate : localDateKey();
    const currentDate = localDateKey();
    return {
      version: 1,
      exercise: typeof record.exercise === "string" ? record.exercise : "",
      reps:
        typeof record.reps === "number" && Number.isFinite(record.reps)
          ? Math.max(1, Math.round(record.reps))
          : 10,
      durationSec:
        typeof record.durationSec === "number" &&
        Number.isFinite(record.durationSec)
          ? Math.max(0, Math.round(record.durationSec))
          : 90,
      mode: isWorkoutMode(record.mode) ? record.mode : "reps",
      todayDate: currentDate,
      today: todayDate === currentDate ? today : [],
    };
  } catch {
    return fallback;
  }
}

export function writeState(state: PersistedState): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
}

export function writeLocale(locale: Locale): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}
