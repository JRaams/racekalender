export const kinds = ['formula1', 'motogp', 'superbike'] as const;
export type Kind = (typeof kinds)[number];

export type Race = {
  kind?: string;
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
