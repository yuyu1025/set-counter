"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { RotateCcw, Timer, Undo2 } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { Stepper } from "@/components/Stepper";
import { beep, vibrate } from "@/lib/feedback";
import {
  defaultModeForExercise,
  formatClock,
  formatFormula,
  messages,
  presets,
} from "@/lib/i18n";
import {
  commitState,
  getServerStateSnapshot,
  getStateSnapshot,
  subscribeState,
} from "@/lib/state-store";
import type { PersistedState } from "@/lib/storage";
import type { LoggedSet, WorkoutMode } from "@/lib/types";

type Phase = "idle" | "hold" | "rest";

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function SetCounter() {
  const { locale, setLocale } = useLocale();
  const copy = messages[locale];
  const state = useSyncExternalStore(
    subscribeState,
    getStateSnapshot,
    getServerStateSnapshot,
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  function setState(
    updater: PersistedState | ((current: PersistedState) => PersistedState),
  ) {
    const current = getStateSnapshot();
    const next = typeof updater === "function" ? updater(current) : updater;
    commitState(next);
  }

  useEffect(() => {
    if (phase === "idle" || endsAt === null) {
      return;
    }
    const timer = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t < endsAt) {
        return;
      }
      window.clearInterval(timer);
      const completedPhase = phase;
      const current = getStateSnapshot();
      setEndsAt(null);
      setPhase("idle");
      if (completedPhase === "hold" && current.exercise.trim()) {
        const entry: LoggedSet = {
          id: createId(),
          exercise: current.exercise.trim(),
          mode: "timed",
          reps: 1,
          durationSec: current.durationSec,
          at: Date.now(),
        };
        commitState({ ...current, today: [...current.today, entry] });
        vibrate(30);
        beep(520, 220);
        return;
      }
      vibrate([40, 60, 80]);
      beep(660, 160);
      window.setTimeout(() => beep(990, 180), 140);
    }, 200);
    return () => window.clearInterval(timer);
  }, [phase, endsAt]);

  const remainingSec =
    endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1000));

  useEffect(() => {
    const shouldLock = phase !== "idle" || state.today.length > 0;
    if (!shouldLock || typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      return;
    }
    let cancelled = false;
    const lock = navigator.wakeLock as {
      request: (type: "screen") => Promise<{ release: () => Promise<void> }>;
    };
    void lock.request("screen").then((sentinel) => {
      if (cancelled) {
        void sentinel.release();
        return;
      }
      wakeLockRef.current = sentinel;
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      if (wakeLockRef.current) {
        void wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [phase, state.today.length]);

  const currentSets = useMemo(
    () =>
      state.today.filter(
        (item) => item.exercise.trim() === state.exercise.trim() && item.exercise.trim() !== "",
      ),
    [state.exercise, state.today],
  );
  const setCount = currentSets.length;
  const volume = currentSets.reduce((sum, item) => sum + item.reps, 0);
  const firstAt = state.today[0]?.at;
  const elapsedSec = firstAt ? Math.max(0, Math.floor((now - firstAt) / 1000)) : 0;
  const exerciseName = state.exercise.trim();

  function update<K extends keyof typeof state>(key: K, value: (typeof state)[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function logSet(mode: WorkoutMode, reps: number, durationSec: number) {
    if (!exerciseName) {
      return;
    }
    const entry: LoggedSet = {
      id: createId(),
      exercise: exerciseName,
      mode,
      reps,
      durationSec,
      at: Date.now(),
    };
    setState((current) => ({ ...current, today: [...current.today, entry] }));
    vibrate(30);
    if (mode === "reps" && state.durationSec > 0) {
      setPhase("rest");
      setEndsAt(Date.now() + state.durationSec * 1000);
      setNow(Date.now());
    } else {
      setPhase("idle");
      setEndsAt(null);
    }
  }

  function handlePrimary() {
    if (!exerciseName) {
      return;
    }
    if (state.mode === "timed") {
      setPhase("hold");
      setEndsAt(Date.now() + Math.max(1, state.durationSec) * 1000);
      setNow(Date.now());
      vibrate(20);
      return;
    }
    logSet("reps", state.reps, state.durationSec);
  }

  function skipTimer() {
    if (phase === "hold") {
      logSet("timed", 1, state.durationSec);
      beep(520, 220);
      return;
    }
    setPhase("idle");
    setEndsAt(null);
  }

  function undo() {
    setState((current) => ({ ...current, today: current.today.slice(0, -1) }));
  }

  function resetToday() {
    setState((current) => ({ ...current, today: [] }));
    setPhase("idle");
    setEndsAt(null);
  }

  function choosePreset(id: string) {
    const preset = presets.find((item) => item.id === id);
    if (!preset) {
      return;
    }
    const name = locale === "zh" ? preset.zh : preset.en;
    setState((current) => ({
      ...current,
      exercise: name,
      mode: defaultModeForExercise(name),
      durationSec: defaultModeForExercise(name) === "timed" ? 45 : current.durationSec,
    }));
  }

  const overlayActive = phase !== "idle" && endsAt !== null;
  const primaryDisabled = !exerciseName;

  return (
    <div className="stage">
      <div className="stripe" aria-hidden="true" />
      <div className="watermark" aria-hidden="true">
        {String(setCount).padStart(2, "0")}
      </div>

      <header className="topbar">
        <div>
          <p className="kicker">distinctive.fun</p>
          <h1>{copy.title}</h1>
        </div>
        <div className="lang-switch" role="group" aria-label="Language">
          <button
            type="button"
            className={locale === "en" ? "is-active" : ""}
            onClick={() => setLocale("en")}
          >
            {copy.languageEn}
          </button>
          <button
            type="button"
            className={locale === "zh" ? "is-active" : ""}
            onClick={() => setLocale("zh")}
          >
            {copy.languageZh}
          </button>
        </div>
      </header>

      <p className="tagline">{copy.tagline}</p>

      <section className="panel">
        <label className="field">
          <span>{copy.exercise}</span>
          <input
            value={state.exercise}
            placeholder={copy.exercisePlaceholder}
            autoCapitalize="words"
            autoComplete="off"
            onChange={(event) => {
              const next = event.target.value;
              setState((current) => ({
                ...current,
                exercise: next,
                mode:
                  defaultModeForExercise(next) === "timed"
                    ? "timed"
                    : current.mode,
              }));
            }}
          />
        </label>

        <div className="chips">
          {presets.map((preset) => {
            const label = locale === "zh" ? preset.zh : preset.en;
            const active = state.exercise === label;
            return (
              <button
                key={preset.id}
                type="button"
                className={active ? "chip is-active" : "chip"}
                onClick={() => choosePreset(preset.id)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mode-switch" role="tablist" aria-label="Mode">
          <button
            type="button"
            role="tab"
            aria-selected={state.mode === "reps"}
            className={state.mode === "reps" ? "is-active" : ""}
            onClick={() => update("mode", "reps")}
          >
            {copy.modeReps}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={state.mode === "timed"}
            className={state.mode === "timed" ? "is-active" : ""}
            onClick={() => update("mode", "timed")}
          >
            {copy.modeTimed}
          </button>
        </div>

        <div className="stepper-grid">
          {state.mode === "reps" ? (
            <Stepper
              label={copy.reps}
              value={state.reps}
              min={1}
              max={99}
              onChange={(value) => update("reps", value)}
            />
          ) : null}
          <Stepper
            label={copy.duration}
            value={state.durationSec}
            min={state.mode === "timed" ? 1 : 0}
            max={600}
            step={state.mode === "timed" ? 5 : 15}
            onChange={(value) => update("durationSec", value)}
          />
        </div>
        <p className="hint">
          {state.mode === "timed" ? copy.durationHintTimed : copy.durationHintReps}
        </p>
      </section>

      <section className="stats" aria-live="polite">
        <div>
          <span>{copy.sets}</span>
          <strong>{setCount}</strong>
        </div>
        <div>
          <span>{copy.volume}</span>
          <strong>{volume}</strong>
        </div>
        <div>
          <span>{copy.elapsed}</span>
          <strong>{formatClock(elapsedSec)}</strong>
        </div>
      </section>

      <p className="formula">
        {formatFormula(
          locale,
          setCount,
          state.mode === "timed" ? 1 : state.reps,
          volume,
        )}
      </p>

      <section className="log">
        <div className="log-head">
          <h2>{copy.today}</h2>
          <div className="log-actions">
            <button type="button" onClick={undo} disabled={state.today.length === 0}>
              <Undo2 size={16} strokeWidth={2.2} />
              {copy.undo}
            </button>
            <button type="button" onClick={resetToday} disabled={state.today.length === 0}>
              <RotateCcw size={16} strokeWidth={2.2} />
              {copy.reset}
            </button>
          </div>
        </div>
        {state.today.length === 0 ? (
          <p className="empty">{copy.empty}</p>
        ) : (
          <ol>
            {[...state.today].reverse().map((item, index) => (
              <li key={item.id}>
                <b>{state.today.length - index}</b>
                <span>{item.exercise}</span>
                <em>
                  {item.mode === "timed"
                    ? `${item.durationSec}s`
                    : `×${item.reps}`}
                </em>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="cta-wrap">
        <button
          type="button"
          className="cta"
          disabled={primaryDisabled}
          onClick={handlePrimary}
        >
          <Timer size={28} strokeWidth={2.4} />
          {state.mode === "timed" ? copy.startHold : copy.logSet}
        </button>
      </div>

      {overlayActive ? (
        <div className="overlay" role="dialog" aria-modal="true">
          <p className="overlay-kicker">
            {phase === "hold" ? copy.holding : copy.rest}
          </p>
          <p className="overlay-count">{formatClock(remainingSec)}</p>
          <p className="overlay-exercise">{exerciseName}</p>
          <button type="button" className="overlay-skip" onClick={skipTimer}>
            {phase === "hold" ? copy.logSet : copy.skipRest}
          </button>
        </div>
      ) : null}
    </div>
  );
}
