import dayjs from 'dayjs';
import 'dayjs/locale/nl';
import { ui } from '../src/i18n/ui';
import type { RaceWeek } from './types';

dayjs.locale('nl');

const f1Text = await Bun.file(`${import.meta.dir}/../static/2026/f1.json`).text();
const motogpText = await Bun.file(`${import.meta.dir}/../static/2026/motogp.json`).text();

const f1Data = JSON.parse(f1Text) as RaceWeek[];
const motogpData = JSON.parse(motogpText) as RaceWeek[];

// 1. Find min and max race date
let minDate = new Date(2528540395000);
let maxDate = new Date(0);

for (const raceWeek of f1Data) {
  for (const event of raceWeek.events) {
    const date = new Date(event.startAt);
    if (date < minDate) {
      minDate = date;
    }
    if (date > maxDate) {
      maxDate = date;
    }
  }
}

for (const raceWeek of motogpData) {
  for (const event of raceWeek.events) {
    if (event.type !== 'race') continue;
    const date = new Date(event.startAt);
    if (date < minDate) {
      minDate = date;
    }
    if (date > maxDate) {
      maxDate = date;
    }
  }
}

// 2. List every weekend between min and max date
const dates: Record<
  string,
  {
    f1: RaceWeek | undefined;
    motogp: RaceWeek | undefined;
  }
> = {};

for (let date = minDate; date <= maxDate; date.setDate(date.getDate() + 7)) {
  const format = dayjs(date).format('YYYY-MM-DD');
  dates[format] = { f1: undefined, motogp: undefined };
}

// 3. Add f1 data to dates
for (const raceWeek of f1Data) {
  for (const event of raceWeek.events) {
    if (event.type !== 'race') continue;
    const date = new Date(event.startAt);
    const format = dayjs(date).format('YYYY-MM-DD');

    if (!dates[format]) {
      console.log(`f1 date ${format} not found`);
      dates[format] = { f1: undefined, motogp: undefined };
    }

    dates[format].f1 = raceWeek;
  }
}

// 4. Add motogp data to dates
for (const raceWeek of motogpData) {
  for (const event of raceWeek.events) {
    if (event.type !== 'race') continue;
    const date = new Date(event.startAt);
    const format = dayjs(date).format('YYYY-MM-DD');

    if (!dates[format]) {
      console.log(`motogp date ${format} not found`);
      dates[format] = { f1: undefined, motogp: undefined };
    }

    dates[format].motogp = raceWeek;
  }
}

// 5. Export to csv
let csv = 'Datum,,Formule 1,,,Moto GP,\n';
csv += '\n';
csv += ',#,Land,Plaats,#,Land,Plaats\n';

let f1Index = 1;
let motogpIndex = 1;

function translateCountry(countryCode: string) {
  const key = 'country.' + countryCode.toUpperCase();
  const translation = ui.nl[key as keyof typeof ui.nl];
  if (!translation) {
    throw new Error(`Could not translate country ${countryCode}`);
  }
  return translation;
}

Object.entries(dates)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([dateString, raceWeeks]) => {
    let parts: (string | number)[] = [dayjs(dateString).format('DD MMM')];

    if (raceWeeks.f1) {
      parts.push(f1Index++, translateCountry(raceWeeks.f1.circuit.countryCode), raceWeeks.f1.circuit.city);
    } else {
      parts.push('', '', '');
    }

    if (raceWeeks.motogp) {
      parts.push(motogpIndex++, translateCountry(raceWeeks.motogp.circuit.countryCode), raceWeeks.motogp.circuit.city);
    } else {
      parts.push('', '', '');
    }

    csv += `${parts.join(',')}\n`;
  });

// export to csv file using bun
await Bun.write(`kalender.csv`, csv);
