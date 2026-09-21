import { LOCALE_STORAGE_KEY } from "@/lib/locale-boot";
import type { Locale } from "@/lib/types";

export function detectLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === "zh" || saved === "en") {
      return saved;
    }
    const fromDom = document.documentElement.dataset.locale;
    if (fromDom === "zh" || fromDom === "en") {
      return fromDom;
    }
    const languages =
      navigator.languages.length > 0
        ? navigator.languages
        : navigator.language
          ? [navigator.language]
          : [];
    if (languages.some((item) => item.toLowerCase().startsWith("zh"))) {
      return "zh";
    }
    return "en";
  } catch {
    return "en";
  }
}

export function applyLocale(locale: Locale): void {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  document.documentElement.dataset.locale = locale;
}
