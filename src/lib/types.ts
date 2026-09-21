export type Locale = "en" | "zh";

export type WorkoutMode = "reps" | "timed";

export type LoggedSet = {
  id: string;
  exercise: string;
  mode: WorkoutMode;
  reps: number;
  durationSec: number;
  at: number;
};
