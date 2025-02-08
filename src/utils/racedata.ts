import f12024 from '~/static/2024/f1.json';
import motogp2024 from '~/static/2024/motogp.json';
import superbike2024 from '~/static/2024/superbike.json';
import f12025 from '~/static/2025/f1.json';
import motogp2025 from '~/static/2025/motogp.json';
import superbike2025 from '~/static/2025/superbike.json';
import type { Kind, RaceWeek } from '~/types';

const year2024 = {
  formula1: f12024,
  motogp: motogp2024,
  superbike: superbike2024,
} satisfies Record<Kind, RaceWeek[]>;

const year2025 = {
  formula1: f12025,
  motogp: motogp2025,
  superbike: superbike2025,
} satisfies Record<Kind, RaceWeek[]>;

const raceYearData = {
  2024: year2024,
  2025: year2025,
};

export type RaceYear = keyof typeof raceYearData;

export const RaceYears = Object.keys(raceYearData).map(Number);

export default raceYearData;
