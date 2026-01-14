import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import type { Language } from '~/i18n/ui';
import { useTranslations } from '~/i18n/utils';
import type { RaceRow } from '~/types';
import racedata, { type RaceYear } from './racedata';

type WeeklyGroupedRaces = Record<
  number,
  {
    lastRaceDate: number;
    days: Record<
      number,
      {
        timeStamp: number;
        races: RaceRow[];
      }
    >;
  }
>;

export function CreateGroupedRaceRows(raceYear: RaceYear, lang: Language): WeeklyGroupedRaces {
  dayjs.extend(isoWeek);
  const t = useTranslations(lang);
  const races: RaceRow[] = [];

  const yearlyData = racedata[raceYear];

  yearlyData?.formula1?.forEach((raceWeek) => {
    raceWeek.events.forEach((event) => {
      if (event.type !== 'race' && event.type !== 'sprint') return;
      races.push({
        kind: 'formula1',
        round: raceWeek.round,
        name: raceWeek.name.replace(/^formula 1/i, '').replace(/ \d+$/, ''),
        date: event.startAt,
        circuit: {
          name: raceWeek.circuit.name,
          city: raceWeek.circuit.city,
          countryCode: raceWeek.circuit.countryCode,
          country: t(`country.${raceWeek.circuit.countryCode}` as any),
        },
        type: event.type,
      });
    });
  });

  yearlyData?.motogp?.forEach((raceWeek) => {
    raceWeek.events.forEach((event) => {
      if (event.type !== 'sprint' && event.type !== 'race') return;
      races.push({
        kind: 'motogp',
        round: raceWeek.round,
        name: raceWeek.name,
        date: event.startAt,
        circuit: {
          name: raceWeek.circuit.name,
          city: raceWeek.circuit.city,
          countryCode: raceWeek.circuit.countryCode,
          country: t(`country.${raceWeek.circuit.countryCode}` as any),
        },
        type: event.type,
      });
    });
  });

  yearlyData?.superbike?.forEach((raceWeek) => {
    raceWeek.events.forEach((event) => {
      if (event.type !== 'superpole_race' && event.type !== 'race') return;

      races.push({
        kind: 'superbike',
        round: raceWeek.round,
        name: raceWeek.name,
        date: event.startAt,
        circuit: {
          name: raceWeek.circuit.name,
          city: raceWeek.circuit.city,
          countryCode: raceWeek.circuit.countryCode,
          country: t(`country.${raceWeek.circuit.countryCode}` as any),
        },
        type: event.type,
      });
    });
  });

  races.sort((a, b) => a.date - b.date);

  const weeks: WeeklyGroupedRaces = {};

  races.forEach((race) => {
    const week = dayjs(race.date).isoWeek();
    weeks[week] ??= {
      lastRaceDate: 0,
      days: {},
    };

    const weekday = dayjs(race.date).isoWeekday();
    weeks[week].days[weekday] ??= {
      timeStamp: 0,
      races: [],
    };
    weeks[week].days[weekday].races.push(race);
  });

  Object.values(weeks).forEach((week) => {
    Object.values(week.days).forEach((day) => {
      day.races.forEach((race) => {
        if (race.date > week.lastRaceDate) {
          week.lastRaceDate = race.date;
        }
        if (day.timeStamp === 0 || race.date < day.timeStamp) {
          day.timeStamp = race.date;
        }
      });
    });
  });

  return weeks;
}
