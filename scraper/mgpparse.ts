import { mgpCircuits } from "./circuits";
import type { MotoGPWeekendMeta, RaceWeek } from "./types";

const mgpMeta = await Bun.file(`${import.meta.dir}/meta/motogp.json`).text();

const mgpMetaData = JSON.parse(mgpMeta);

async function fetchEventSchedule(eventId: string): Promise<any> {
  try {
    const response = await fetch(`https://api.pulselive.motogp.com/motogp/v1/events/${eventId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch schedule for event ${eventId}: ${error}`);
  }
}

function mapEventType(kind: string, name: string): string {
  const kindLower = kind.toLowerCase();
  const nameLower = name.toLowerCase();
  
  if (kindLower === 'race') {
    if (nameLower.includes('sprint')) {
      return 'sprint';
    }
    return 'race';
  }
  if (kindLower === 'qualifying') {
    return 'qualifying';
  }
  if (kindLower === 'practice') {
    return 'practice';
  }
  if (kindLower === 'warm_up') {
    return 'practice'; 
  }
  
  return 'practice';
}

type Circuit = {
  country: string;
  countryCode: string;
  city: string;
  name: string;
  length?: number;
};

function findCircuit(circuitName: string, eventName: string): Circuit | null {
  if (!circuitName) return null;

  const circuitNameLower = circuitName.toLowerCase();
  const eventNameLower = eventName.toLowerCase();

  // Try exact match first
  const exactMatch = mgpCircuits.find((circuit: Circuit) => 
    circuit.name.toLowerCase() === circuitNameLower
  );
  if (exactMatch) return exactMatch;

  // Try partial match
  const partialMatch = mgpCircuits.find((circuit: Circuit) => 
    circuit.name.toLowerCase().includes(circuitNameLower) ||
    circuitNameLower.includes(circuit.name.toLowerCase())
  );
  if (partialMatch) return partialMatch;

  // Try matching by event name/city
  if (eventNameLower) {
    const cityMatch = mgpCircuits.find((circuit: Circuit) => 
      circuit.city.toLowerCase() === eventNameLower ||
      eventNameLower.includes(circuit.city.toLowerCase()) ||
      circuit.city.toLowerCase().includes(eventNameLower)
    );
    if (cityMatch) return cityMatch;
  }

  return null;
}

async function parseRaceWeek(meta: MotoGPWeekendMeta): Promise<RaceWeek | null> {
  const scheduleData = await fetchEventSchedule(meta.eventId);
  
  if (!scheduleData) {
    throw new Error(`Failed to fetch event data for ${meta.fileName}`);
  }

  const raceName = scheduleData.additional_name || scheduleData.name || meta.fileName.toUpperCase();
  
  const apiCircuit = scheduleData.circuit;
  if (!apiCircuit) {
    throw new Error(`Failed to extract circuit from API response for ${meta.fileName}`);
  }
  
  const circuitName = apiCircuit.name || '';
  const circuitCity = apiCircuit.city || raceName;
  
  const motogpCategoryInfo = scheduleData.categories?.find((c: any) => c.acronym === 'MGP');
  const motogpCategoryId = motogpCategoryInfo?.id;
  
  const motogpCategoryData = scheduleData.event_categories?.find((cat: any) => 
    cat.category_id === motogpCategoryId
  );
  const raceLaps = motogpCategoryData?.num_laps || null;
  const sprintLaps = motogpCategoryData?.sprint_num_laps || null;
  
  let circuit = findCircuit(circuitName, circuitCity);
  if (!circuit) {
    throw new Error(`Failed to find circuit for ${circuitName} ${circuitCity}`);
  }

  const broadcasts = scheduleData.broadcasts || [];
  
  const motogpSessions = broadcasts.filter((session: any) => 
    session.category?.acronym === 'MGP'
  );
  
  const events = motogpSessions.map((session: any) => {
    const name = session.name || '';
    const kind = session.kind || '';
    const eventType = mapEventType(kind, name);
    const startAt = session.date_start ? new Date(session.date_start).getTime() : 0;
    const endAt = session.date_end ? new Date(session.date_end).getTime() : null;
    
    let laps: number | null = null;
    if (eventType === 'race') {
      laps = session.num_laps && session.num_laps > 0 ? session.num_laps : raceLaps;
    } else if (eventType === 'sprint') {
      laps = session.num_laps && session.num_laps > 0 ? session.num_laps : sprintLaps;
    }
    
    return {
      name,
      type: eventType,
      startAt,
      endAt,
      laps,
    };
  });

  return {
    round: meta.index + 1,
    name: raceName,
    circuit,
    events,
  };
}

const raceWeeks: RaceWeek[] = [];

for (const meta of mgpMetaData as MotoGPWeekendMeta[]) {
  try {
    const raceWeek = await parseRaceWeek(meta);
    if (raceWeek) {
      raceWeeks.push(raceWeek);
    }
  } catch (error) {
    throw new Error(`Error processing ${meta.fileName} (round ${meta.index + 1}): ${error}`);
  }
}

await Bun.write(`${import.meta.dir}/data/motogp.json`, JSON.stringify(raceWeeks, null, 2));