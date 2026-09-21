import { applyLocale, detectLocale } from "@/lib/detect-locale";
import {
  defaultState,
  readState,
  writeLocale,
  writeState,
  type PersistedState,
} from "@/lib/storage";
import type { Locale } from "@/lib/types";

const STATE_EVENT = "sets-state-changed";
const LOCALE_EVENT = "sets-locale-changed";

export function subscribeState(onStoreChange: () => void): () => void {
  window.addEventListener(STATE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(STATE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function getStateSnapshot(): PersistedState {
  return readState();
}

export function getServerStateSnapshot(): PersistedState {
  return defaultState();
}

export function commitState(next: PersistedState): void {
  writeState(next);
  window.dispatchEvent(new Event(STATE_EVENT));
}

export function subscribeLocale(onStoreChange: () => void): () => void {
  window.addEventListener(LOCALE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(LOCALE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function getLocaleSnapshot(): Locale {
  return detectLocale();
}

export function getServerLocaleSnapshot(): Locale {
  return "en";
}

export function commitLocale(next: Locale): void {
  writeLocale(next);
  applyLocale(next);
  window.dispatchEvent(new Event(LOCALE_EVENT));
}
