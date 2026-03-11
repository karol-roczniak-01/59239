import { createContext, useContext } from 'react'
import type { Language, TextKey } from '@/texts'
import { texts } from '@/texts'

function getCookieLang(): Language {
  const match = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/)
  const val = match?.[1]
  return (val === 'en' || val === 'pl') ? val : 'en'
}

type LanguageContextType = {
  language: Language
  t: (key: TextKey) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = getCookieLang()
  const t = (key: TextKey): string => texts[language][key]

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}