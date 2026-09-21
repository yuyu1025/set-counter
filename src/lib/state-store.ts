import { applyLocale, detectLocale } from "@/lib/detect-locale";
import {
  STATE_STORAGE_KEY,
  defaultState,
  readState,
  writeLocale,
  writeState,
  type PersistedState,
} from "@/lib/storage";
import type { Locale } from "@/lib/types";

const STATE_EVENT = "sets-state-changed";
const LOCALE_EVENT = "sets-locale-changed";
const SERVER_STATE = defaultState();

let cachedState: PersistedState = SERVER_STATE;
let cachedRaw: string | null = null;
let cacheReady = false;

export function subscribeState(onStoreChange: () => void): () => void {
  window.addEventListener(STATE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(STATE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function getStateSnapshot(): PersistedState {
  const raw = window.localStorage.getItem(STATE_STORAGE_KEY);
  if (cacheReady && raw === cachedRaw) {
    return cachedState;
  }
  cachedState = readState();
  cachedRaw = raw;
  cacheReady = true;
  return cachedState;
}

export function getServerStateSnapshot(): PersistedState {
  return SERVER_STATE;
}

export function commitState(next: PersistedState): void {
  writeState(next);
  cachedState = next;
  cachedRaw = window.localStorage.getItem(STATE_STORAGE_KEY);
  cacheReady = true;
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
