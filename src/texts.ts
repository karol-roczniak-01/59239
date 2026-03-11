export type Language = 'en' | 'pl'

export const LANGUAGES: Array<{ value: Language; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'pl', label: 'Polski' }
]

export const texts = {
  en: {
    // --- Navigation & Actions ---
    logIn: 'Log In',
    loggingIn: 'Logging In...',
    logOut: 'Log Out',
    createAccount: 'Create Account',
    create: 'Create',
    apply: 'Apply',
    applied: 'Applied',
    search: 'Search',
    searching: 'Searching...',
    wait: 'Wait...',

    // --- Page Headings & Descriptions ---
    loginWelcome: 'Log in to your 19-18-8-103 account.',
    indexWelcome: 'Welcome to 5-92-39! — AI-powered tender platform connecting suppliers with buyers.',
    appliedWelcome: 'Your applications',
    appliedWelcomeSub: 'Open any to view contact details and move forward.',
    demandWelcome: 'Demand',
    myDemandsWelcome: 'Your posted demands',
    myDemandsWelcomeSub: 'Open any to view contact details and move forward.',
    newDemandWelcome: "Describe the product or service you're looking for — be specific so suppliers can find you.",
    findMatchWelcome: 'Describe what your company offers — be specific to get better matches (30–500 characters).',

    // --- Form: Email ---
    emailLabel: 'Email',
    emailPlaceholder: 'email@example.com',
    emailRequired: 'Email is required',
    emailValidation: 'Invalid email format',

    // --- Form: Password ---
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    passwordRequired: 'Password is required',

    // --- Form: Demand ---
    demandContentLabel: 'Description',
    demandContentPlaceholder: "I'm building a family home 30 miles outside Dallas and need a framing crew for a 2,000 sq ft single-story house. Work to start in April, budget around $45,000.",
    demandContentRequired: 'Description is required',
    demandContentMin: 'Minimum 50 characters',
    demandContentMax: 'Maximum 1000 characters',
    daysValidation: 'Enter between 7 and 180 days',

    // --- Form: Supply / Find Opportunity ---
    findMatchQuery: 'We are a framing company based in the Houston metro area, handling residential projects from 1,200 to 3,500 sq ft. Available from March onwards.',
    supplyContentPlaceholder: "Describe how you'd fulfill this demand...",
    supplyContentMin: 'Minimum 30 characters',
    supplyContentMax: 'Maximum 300 characters',

    // --- Form: Contact ---
    phoneLabel: 'Phone',
    phonePlaceholder: '+1 (214) 555-0123 (optional)',

    // --- Status & Feedback ---
    noApplicationsYet: 'No applications yet...',
    noDemandsYet: 'No demands yet...',
    noDemandsFound: 'No matching demands found',
    noSupplyYet: 'No supply offers yet...',
    expired: 'Expired',
    dailyLimitReached: 'Daily limit reached',
    activeDemandLimitReached: 'Active demand limit reached (50)',
    limitOfDemandsReached: 'Limit of 50 demands reached',
    submittingApplication: 'Submitting your application...',
    redirectingToPayment: 'Redirecting to Payment...',

    // --- UI Labels ---
    newDemand: 'New Demand',
    myDemands: 'My Demands',
    findMatch: 'Find Opportunity',
    days: 'Days',
    note: 'Note',
    details: 'Details',
    suppliers: 'Suppliers',
    leftToday: '',
    leftTodaySub: 'left today',
    continueToPayment: 'Continue to Payment',
  },
  pl: {
    // --- Nawigacja i akcje ---
    logIn: 'Zaloguj się',
    loggingIn: 'Logowanie...',
    logOut: 'Wyloguj się',
    createAccount: 'Utwórz konto',
    create: 'Utwórz',
    apply: 'Aplikuj',
    applied: 'Zaaplikowano',
    search: 'Szukaj',
    searching: 'Szukam...',
    wait: 'Czekaj...',

    // --- Nagłówki i opisy stron ---
    loginWelcome: 'Zaloguj się na swoje konto 19-18-8-103.',
    indexWelcome: 'Witaj w 5-92-39! — Platformie łączącej zleceniodawców z wykonawcami przy pomocy AI.',
    appliedWelcome: 'Twoje aplikacje',
    appliedWelcomeSub: 'Otwórz dowolną, aby zobaczyć dane kontaktowe i przejść dalej.',
    demandWelcome: 'Zapotrzebowanie',
    myDemandsWelcome: 'Twoje opublikowane zapotrzebowania',
    myDemandsWelcomeSub: 'Otwórz dowolne, aby zobaczyć dane kontaktowe i przejść dalej.',
    newDemandWelcome: 'Opisz produkt lub usługę, której szukasz — im dokładniej, tym łatwiej znajdą Cię dostawcy.',
    findMatchWelcome: 'Opisz, co oferuje Twoja firma — im dokładniej, tym lepsze dopasowania (30–500 znaków).',

    // --- Formularz: Email ---
    emailLabel: 'Email',
    emailPlaceholder: 'imie@email.com',
    emailRequired: 'Email jest wymagany',
    emailValidation: 'Nieprawidłowy format adresu email',

    // --- Formularz: Hasło ---
    passwordLabel: 'Hasło',
    passwordPlaceholder: '••••••••',
    passwordRequired: 'Hasło jest wymagane',

    // --- Formularz: Zapotrzebowanie ---
    demandContentLabel: 'Opis',
    demandContentPlaceholder: 'Buduję dom jednorodzinny 40 km od Warszawy i szukam ekipy do stanu surowego dla domu 180m² parterowego. Start w kwietniu, budżet około 40 000 PLN.',
    demandContentRequired: 'Opis jest wymagany',
    demandContentMin: 'Minimum 50 znaków',
    demandContentMax: 'Maksimum 1000 znaków',
    daysValidation: 'Podaj wartość między 7 a 180 dni',

    // --- Formularz: Oferta / Znajdź okazję ---
    findMatchQuery: 'Jesteśmy firmą budowlaną z Mazowsza realizującą projekty mieszkalne od 100 do 300m². Dostępni od marca.',
    supplyContentPlaceholder: 'Opisz krótko, jak zrealizujesz to zapotrzebowanie, lub zostaw notatkę',
    supplyContentMin: 'Minimum 30 znaków',
    supplyContentMax: 'Maksimum 300 znaków',

    // --- Formularz: Kontakt ---
    phoneLabel: 'Telefon',
    phonePlaceholder: '+48 123 456 789 (opcjonalnie)',

    // --- Status i informacje zwrotne ---
    noApplicationsYet: 'Brak aplikacji...',
    noDemandsYet: 'Brak zapotrzebowań...',
    noDemandsFound: 'Nie znaleziono pasujących zapotrzebowań',
    noSupplyYet: 'Brak ofert dostawców...',
    expired: 'Wygasłe',
    dailyLimitReached: 'Dzienny limit wyczerpany',
    activeDemandLimitReached: 'Osiągnięto limit aktywnych zapotrzebowań (50)',
    limitOfDemandsReached: 'Osiągnięto limit 50 zapotrzebowań',
    submittingApplication: 'Wysyłanie aplikacji...',
    redirectingToPayment: 'Przekierowanie do płatności...',

    // --- Etykiety UI ---
    newDemand: 'Nowe Zapotrzebowanie',
    myDemands: 'Moje Zapotrzebowania',
    findMatch: 'Znajdź Dopasowanie',
    days: 'Dni',
    note: 'Notatka',
    details: 'Szczegóły',
    suppliers: 'Dostawcy',
    leftToday: 'pozostało',
    leftTodaySub: '',
    continueToPayment: 'Przejdź do płatności',
  }
} satisfies Record<Language, Record<string, string>>

export type TextKey = keyof typeof texts.en