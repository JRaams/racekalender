export const languages = {
  'en': {
    label: 'English',
    flagIconName: 'flagpack:gb-ukm'
  },
  'nl': {
    label: 'Nederlands',
    flagIconName: 'flagpack:nl'
  }
}

export type Language = keyof typeof languages;

export const defaultLang = "nl" satisfies Language;

export const ui = {
  en: {
    "nav.title": "Racecalendar 2024",
    "list.table.round": "Round",
    "list.table.name": "Name",
    "list.table.date": "Date",
    "list.table.circuit": "Circuit",
    "time.today": "Today!"
  },
  nl: {
    "nav.title": "Racekalender 2024",
    "list.table.round": "Ronde",
    "list.table.name": "Naam",
    "list.table.date": "Datum",
    "list.table.circuit": "Circuit",
    "time.today": "Vandaag!"
  },
} as const;
