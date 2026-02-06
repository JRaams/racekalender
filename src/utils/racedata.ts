import f12024 from '~/static/2024/f1.json';
import motogp2024 from '~/static/2024/motogp.json';
import superbike2024 from '~/static/2024/superbike.json';
import f12025 from '~/static/2025/f1.json';
import motogp2025 from '~/static/2025/motogp.json';
import superbike2025 from '~/static/2025/superbike.json';
import f12026 from '~/static/2026/f1.json';
import motogp2026 from '~/static/2026/motogp.json';
import type { Kind, RaceWeek } from '~/types';

export const RaceYears = [2024, 2025, 2026] as const;

export type RaceYear = (typeof RaceYears)[number];

const raceYearData: Record<RaceYear, Partial<Record<Kind, RaceWeek[]>>> = {
  2024: {
    formula1: f12024,
    motogp: motogp2024,
    superbike: superbike2024,
  },
  2025: {
    formula1: f12025,
    motogp: motogp2025,
    superbike: superbike2025,
  },
  2026: {
    formula1: f12026,
    motogp: motogp2026,
  },
};

export default raceYearData;
