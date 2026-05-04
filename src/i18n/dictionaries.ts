import "server-only";

const dictionaries = {
  en: () => import("./messages/en.json").then((module) => module.default),
  id: () => import("./messages/id.json").then((module) => module.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

import { cacheLife } from "next/cache";

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  "use cache";
  cacheLife("weeks");
  if (locale in dictionaries) {
    return dictionaries[locale as keyof typeof dictionaries]();
  }
  return dictionaries["en"]();
};
