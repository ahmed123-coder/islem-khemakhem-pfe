import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

let requestLocale: string = defaultLocale;

export function setRequestLocale(locale: string) {
  requestLocale = locale;
}

export function getRequestLocale(): string {
  return requestLocale;
}

export const i18nConfig = {
  locales,
  defaultLocale,
};

export default getRequestConfig(async ({ requestLocale: locale }) => {
  const validatedLocale = typeof locale === 'string' && locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;

  return {
    locale: validatedLocale,
    messages: (await import(`../../messages/${validatedLocale}.json`)).default,
  };
});

export async function getMessages(locale?: string) {
  const validatedLocale = locale && locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;
  return (await import(`../../messages/${validatedLocale}.json`)).default;
}