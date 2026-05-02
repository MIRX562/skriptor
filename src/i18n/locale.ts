"use server";

import { cookies, headers } from "next/headers";

const LOCALE_COOKIE = "NEXT_LOCALE";
const DEFAULT_LOCALE = "en";

export async function getLocale() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  
  if (cookieLocale) return cookieLocale;

  try {
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language");
    
    if (acceptLanguage) {
      const preferredLanguage = acceptLanguage.split(",")[0].split("-")[0].toLowerCase();
      if (preferredLanguage === "in" || preferredLanguage === "id") {
        return "id";
      }
    }
  } catch (error) {
    // In case headers() is called in a context where it's not available
  }

  return DEFAULT_LOCALE;
}

export async function setLocale(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 31536000 }); // 1 year
}
