export type F1WeekendMeta = {
    index: number;
    link: string;
    fileName: string;
    filePath: string;
};

export type MotoGPWeekendMeta = {
    index: number;
    link: string;
    fileName: string;
    eventId: string;
};

export type RaceWeek = {
    kind?: 'formula1' | 'motogp';
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
        type: string; // 'practice' | 'free_practice' | 'qualifying' | 'superpole_qualifying' | 'superpole' | 'sprint' | 'race';
        startAt: number;
        endAt?: number | null;
        laps?: number | null;
    }[];
};
