import * as htmlparser2 from "htmlparser2";
import { f1Circuits } from "./circuits";
import type { F1WeekendMeta, RaceWeek } from "./types";

const f1Meta = await Bun.file(`${import.meta.dir}/meta/f1.json`).text();

const f1MetaData = JSON.parse(f1Meta);

function extractJsonLd(html: string): any {
  const dom = htmlparser2.parseDocument(html);
  let jsonLdData: any = null;

  function walk(node: any) {
    if (node.type === 'script' && node.attribs?.type === 'application/ld+json') {
      const textNode = node.children?.find((child: any) => child.type === 'text');
      if (textNode?.data) {
        try {
          jsonLdData = JSON.parse(textNode.data);
        } catch (e) {
          throw new Error('Failed to parse JSON-LD: ' + e);
        }
      }
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }

  walk(dom);
  return jsonLdData;
}

function mapEventType(eventId: string): string {
  if (eventId.includes('#Practice-1') || eventId.includes('#Practice-2') || eventId.includes('#Practice-3')) {
    return 'practice';
  }
  if (eventId.includes('#Sprint-Qualifying') || eventId.includes('#Sprint_Qualifying')) {
    return 'sprint_qualifying';
  }
  if (eventId.includes('#Sprint')) {
    return 'sprint';
  }
  if (eventId.includes('#Qualifying')) {
    return 'qualifying';
  }
  if (eventId.includes('#Race')) {
    return 'race';
  }
  throw new Error(`Unknown event type: ${eventId}`);
}

function extractLaps(html: string, eventType: string, circuit: typeof f1Circuits[0] | null): number | null {
  if (eventType === 'sprint') {
    if (circuit && 'length' in circuit && typeof circuit.length === 'number') {
      return Math.ceil(100 / circuit.length);
    }
    return null;
  }
  
  if (eventType === 'race') {
    const lapsMatch = html.match(/<dt[^>]*>Number of Laps<\/dt>\s*<dd[^>]*>(\d+)<\/dd>/i)?.[1];

    if (!lapsMatch) {
      throw new Error('Failed to extract laps from HTML');
    }

    const laps = parseInt(lapsMatch, 10);
    if (isNaN(laps)) {
      throw new Error('Failed to extract laps from HTML');
    }

    return laps;
  }
  
  return null;
}

function findCircuit(location: any): typeof f1Circuits[0] | null {
  if (!location) return null;

  const cityName = location.name?.toLowerCase();
  const address = location.address?.toLowerCase() || '';
  
  const addressParts = address.split(',').map((s: string) => s.trim());
  const countryFromAddress = addressParts.length > 1 ? addressParts[addressParts.length - 1] : null;

  if (cityName) {
    const matchByCity = f1Circuits.find(circuit => 
      circuit.city.toLowerCase() === cityName
    );
    if (matchByCity) return matchByCity;
  }

  if (countryFromAddress) {
    const matchByCountry = f1Circuits.find(circuit => 
      circuit.country.toLowerCase() === countryFromAddress
    );
    if (matchByCountry) return matchByCountry;
  }

  if (cityName) {
    const partialMatch = f1Circuits.find(circuit => 
      circuit.city.toLowerCase().includes(cityName) || 
      cityName.includes(circuit.city.toLowerCase())
    );
    if (partialMatch) return partialMatch;
  }

  return null;
}

function parseRaceWeek(html: string, meta: F1WeekendMeta): RaceWeek | null {
  const jsonLd = extractJsonLd(html);
  if (!jsonLd || !jsonLd.subEvent || !Array.isArray(jsonLd.subEvent)) {
    throw new Error('Failed to extract JSON-LD data or subEvent array');
  }

  const raceName = jsonLd.name?.replace(/\s+\d{4}$/, '')?.replace('FORMULA 1 ', '')?.trim()?.replace(/(\d+)$/, '')?.trim();
  if (!raceName) {
    throw new Error('Failed to extract race name');
  }

  const circuit = findCircuit(jsonLd.location);
  if (!circuit) {
    throw new Error(`Failed to find circuit for location: ${JSON.stringify(jsonLd.location)}`);
  }

  const eventsWithLaps = jsonLd.subEvent.map((subEvent: any) => {
    const name = subEvent.name;
    if (!name) {
      throw new Error('Failed to extract event name');
    }
    const eventType = mapEventType(subEvent['@id'] || '');
    const typeQuantityStr = name.match(/(\d+)/)?.[1];
    const startAt = subEvent.startDate ? new Date(subEvent.startDate).getTime() : 0;
    const endAt = subEvent.endDate ? new Date(subEvent.endDate).getTime() : null;
    const laps = extractLaps(html, eventType, circuit);

    return {
      name,
      type: eventType,
      typeQuantity: typeQuantityStr ? Number(typeQuantityStr) : undefined,
      startAt,
      endAt,
      laps,
    };
  });

  return {
    round: meta.index + 1,
    name: raceName,
    circuit,
    events: eventsWithLaps,
  };
}

const raceWeeks: RaceWeek[] = [];

for (const meta of f1MetaData as F1WeekendMeta[]) {
  const html = await Bun.file(meta.filePath).text();
  const raceWeek = parseRaceWeek(html, meta);
  if (raceWeek) {
    raceWeeks.push(raceWeek);
  }
}

const currentYear = new Date().getFullYear();
await Bun.write(`${import.meta.dir}/../static/${currentYear}/f1.json`, JSON.stringify(raceWeeks, null, 2));