import type { Locale, WorkoutMode } from "@/lib/types";

export type Messages = {
  title: string;
  tagline: string;
  exercise: string;
  exercisePlaceholder: string;
  reps: string;
  duration: string;
  durationHintReps: string;
  durationHintTimed: string;
  modeReps: string;
  modeTimed: string;
  logSet: string;
  startHold: string;
  skipRest: string;
  rest: string;
  holding: string;
  sets: string;
  volume: string;
  elapsed: string;
  today: string;
  undo: string;
  reset: string;
  empty: string;
  languageEn: string;
  languageZh: string;
  formula: string;
  restDone: string;
};

export const messages: Record<Locale, Messages> = {
  en: {
    title: "SETS",
    tagline: "Name the lift. Hit the reps. Count the sets.",
    exercise: "Exercise",
    exercisePlaceholder: "Bench press",
    reps: "Reps / set",
    duration: "Seconds",
    durationHintReps: "Rest after each logged set",
    durationHintTimed: "Hold length for this set",
    modeReps: "Reps",
    modeTimed: "Hold",
    logSet: "Log set",
    startHold: "Start hold",
    skipRest: "Skip rest",
    rest: "Rest",
    holding: "Hold",
    sets: "Sets",
    volume: "Volume",
    elapsed: "Work",
    today: "Today",
    undo: "Undo",
    reset: "Clear today",
    empty: "No sets yet. Log the first one.",
    languageEn: "EN",
    languageZh: "中",
    formula: "{sets} sets × {reps} reps = {volume}",
    restDone: "Up.",
  },
  zh: {
    title: "计组",
    tagline: "写下动作，打完次数，记下组数。",
    exercise: "动作",
    exercisePlaceholder: "卧推",
    reps: "每组次数",
    duration: "秒",
    durationHintReps: "每组结束后的休息时长",
    durationHintTimed: "本组保持时长",
    modeReps: "次数",
    modeTimed: "保持",
    logSet: "记一组",
    startHold: "开始保持",
    skipRest: "跳过休息",
    rest: "休息",
    holding: "保持",
    sets: "组数",
    volume: "总量",
    elapsed: "用时",
    today: "今日",
    undo: "撤销",
    reset: "清空今日",
    empty: "还没有组数。先记第一组。",
    languageEn: "EN",
    languageZh: "中",
    formula: "{sets} 组 × {reps} 次 = {volume}",
    restDone: "起来。",
  },
};

export const presets: { id: string; en: string; zh: string }[] = [
  { id: "bench", en: "Bench press", zh: "卧推" },
  { id: "squat", en: "Squat", zh: "深蹲" },
  { id: "deadlift", en: "Deadlift", zh: "硬拉" },
  { id: "pullup", en: "Pull-up", zh: "引体向上" },
  { id: "pushup", en: "Push-up", zh: "俯卧撑" },
  { id: "plank", en: "Plank", zh: "平板支撑" },
  { id: "ohp", en: "Overhead press", zh: "肩推" },
  { id: "row", en: "Row", zh: "划船" },
];

export function presetLabel(id: string, locale: Locale): string {
  const preset = presets.find((item) => item.id === id);
  if (!preset) {
    return id;
  }
  return locale === "zh" ? preset.zh : preset.en;
}

export function formatFormula(
  locale: Locale,
  sets: number,
  reps: number,
  volume: number,
): string {
  return messages[locale].formula
    .replace("{sets}", String(sets))
    .replace("{reps}", String(reps))
    .replace("{volume}", String(volume));
}

export function formatClock(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function defaultModeForExercise(name: string): WorkoutMode {
  const normalized = name.trim().toLowerCase();
  if (
    normalized === "plank" ||
    normalized === "平板支撑" ||
    normalized === "wall sit" ||
    normalized === "靠墙静蹲"
  ) {
    return "timed";
  }
  return "reps";
}
