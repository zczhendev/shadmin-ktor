/*
 * Copyright (c) 2026 zczhendev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { createContext, useContext, useEffect, useState } from 'react'
import i18n from 'i18next'
import { initReactI18next, I18nextProvider } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'
import { getCookie, setCookie } from '@/lib/cookies'
import en from '@/locales/en.json'
import zh from '@/locales/zh.json'

const LANGUAGE_COOKIE_NAME = 'vite-ui-lang'
const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year
const DEFAULT_LANGUAGE = 'zh'
const SUPPORTED_LANGUAGES = ['en', 'zh'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

// Initialize i18next only once
if (!i18n.isInitialized) {
  const savedLang = getCookie(LANGUAGE_COOKIE_NAME) || DEFAULT_LANGUAGE

  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        zh: { translation: zh },
      },
      lng: savedLang,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES,
      interpolation: { escapeValue: false },
      detection: {
        order: ['cookie', 'localStorage', 'navigator'],
        lookupCookie: LANGUAGE_COOKIE_NAME,
        caches: ['cookie', 'localStorage'],
      },
      backend: {
        loadPath: '/locales/{{lng}}.json',
      },
    })
}

type I18nProviderState = {
  language: Language
  setLanguage: (lang: Language) => void
}

const initialState: I18nProviderState = {
  language: DEFAULT_LANGUAGE,
  setLanguage: () => null,
}

const I18nContext = createContext<I18nProviderState>(initialState)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, _setLanguage] = useState<Language>(
    () => (i18n.language as Language) || DEFAULT_LANGUAGE
  )

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      _setLanguage(lng as Language)
      document.documentElement.lang = lng
    }

    i18n.on('languageChanged', handleLanguageChanged)
    document.documentElement.lang = language

    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [language])

  const setLanguage = (lang: Language) => {
    setCookie(LANGUAGE_COOKIE_NAME, lang, LANGUAGE_COOKIE_MAX_AGE)
    i18n.changeLanguage(lang)
  }

  return (
    <I18nextProvider i18n={i18n}>
      <I18nContext value={{ language, setLanguage }}>
        {children}
      </I18nContext>
    </I18nextProvider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within an I18nProvider')
  return context
}
