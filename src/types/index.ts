export const kinds = ['formula1', 'motogp', 'superbike'] as const;
export type Kind = (typeof kinds)[number];

export const KindToLabelMap: Record<Kind, string> = {
  formula1: 'F1',
  motogp: 'MotoGP',
  superbike: 'SBK',
};

export type RaceWeek = {
  kind?: Kind;
  round: number;
  name: string;
  circuit: {
    countryCode: string;
    country: string;
    region?: string;
    city: string;
    name: string;
  };
  events: {
    name: string;
    type: string; // 'practice' | 'qualifying' | 'superpole_qualifying' | 'superpole' | 'sprint' | 'race';
    startAt: number;
    endAt?: number | null;
    laps?: number | null;
  }[];
};

export type RaceRow = {
  kind: Kind;
  round: number;
  type: 'sprint' | 'race' | 'superpole_race';
  name: string;
  date: number;
  circuit: {
    countryCode: string;
    country: string;
    city: string;
    name: string;
  };
};
