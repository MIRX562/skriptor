import "server-only";

const dictionaries = {
  en: () => import("./messages/en.json").then((module) => module.default),
  id: () => import("./messages/id.json").then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  if (locale in dictionaries) {
    return dictionaries[locale as keyof typeof dictionaries]();
  }
  return dictionaries["en"]();
};
