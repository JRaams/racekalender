export type Race = {
  kind?: 'F1' | 'MotoGP' | 'SBK';
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
