export const kinds = ['formula1', 'motogp', 'superbike'] as const;
export type Kind = (typeof kinds)[number];

export type Race = {
  kind?: string;
  round: number;
  name: string;
  raceTimestamp: number;
  circuit: {
    country: string;
    countryCode: string;
    city: string;
    name: string;
  };
};
