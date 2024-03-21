import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import type { Language } from '~/i18n/ui';
import { useTranslations } from '~/i18n/utils';
import f1 from '~/static/2024/f1.json';
import motogp from '~/static/2024/motogp.json';
import superbike from '~/static/2024/superbike.json';
import type { RaceRow } from '~/types';

export function CreateGroupedRaceRows(lang: Language) {
  dayjs.extend(isoWeek);
  const t = useTranslations(lang);
  const races: RaceRow[] = [];

  f1.forEach((raceWeek) => {
    raceWeek.events.forEach((event) => {
      if (event.type !== 'race' && event.type !== 'sprint') return;
      races.push({
        kind: 'F1',
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

  motogp.forEach((raceWeek) => {
    raceWeek.events.forEach((event) => {
      if (event.type !== 'sprint' && event.type !== 'race') return;
      races.push({
        kind: 'MotoGP',
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

  superbike.forEach((raceWeek) => {
    raceWeek.events.forEach((event) => {
      if (event.type !== 'superpole_race' && event.type !== 'race') return;

      races.push({
        kind: 'SBK',
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

  const weeks: Record<number, RaceRow[]> = {};

  races.forEach((race) => {
    const week = dayjs(race.date).isoWeek();
    weeks[week] ??= [];
    weeks[week]?.push(race);
  });

  return weeks;
}
