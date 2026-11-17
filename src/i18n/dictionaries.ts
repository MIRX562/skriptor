import "server-only";

import enMessages from "./messages/en.json";
import idMessages from "./messages/id.json";

export type Locale = "en" | "id";

export type Dictionary = typeof enMessages;

// Compile-time parity check: id.json must match en.json shape.
const _idParityCheck: Dictionary = idMessages;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./messages/en.json").then((module) => module.default as Dictionary),
  id: () => import("./messages/id.json").then((module) => module.default as Dictionary),
};

import { cacheLife } from "next/cache";

export const getDictionary = async (locale: Locale | string): Promise<Dictionary> => {
  "use cache";
  cacheLife("weeks");
  if (locale === "en" || locale === "id") {
    return dictionaries[locale]();
  }
  return dictionaries.en();
};

export { _idParityCheck };