export type Race = {
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
