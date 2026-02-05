import puppeteer from 'puppeteer-core';

console.log('Launching browser...');

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/brave-browser',
  defaultViewport: null,
  args: ['--start-maximized'],
  headless: false, // todo remove
});

const overviewPage = await browser.newPage();
await overviewPage.emulateTimezone('Europe/London');

console.log('Navigating to overview...');

await overviewPage.goto('https://www.motogp.com/en/calendar?view=grid', {
  waitUntil: 'networkidle2',
  timeout: 0,
});

const weekendLinks = await overviewPage.evaluate(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const container = document.querySelector('.calendar-listing__tab-panel.is-active');
  if (!container) throw new Error('Container .calendar-listing__tab-panel.is-active not found');

  const links: string[] = [];

  container.querySelectorAll('.calendar-grid-card').forEach((anchor: Element) => {
    links.push((anchor as HTMLAnchorElement).href);
  });

  return links;
});

console.log(`Found ${weekendLinks.length} round links`);

await overviewPage.close();

const weekends: { index: number; link: string; fileName: string; eventId: string }[] = [];

// Extract event metadata from links
for (let i = 0; i < weekendLinks.length; i++) {
  const link = weekendLinks[i];
  if (!link) continue;

  try {
    const urlPath = new URL(link).pathname;
    const pathParts = urlPath.split('/').filter(p => p);
    
    // Extract fileName (e.g., "thailand", "brasil") and eventId (UUID)
    // URL format: /en/calendar/2026/event/thailand/364a0bd9-d3c2-4ab3-a4cd-211ff469953e
    const eventIndex = pathParts.indexOf('event');
    if (eventIndex === -1 || eventIndex >= pathParts.length - 1) {
      throw new Error(`Could not parse event from link: ${link}`);
    }
    
    const fileName = pathParts[eventIndex + 1];
    const eventId = pathParts[eventIndex + 2];
    
    if (!fileName || !eventId) {
      throw new Error(`Could not extract fileName or eventId from link: ${link}`);
    }
    
    weekends.push({ index: i, link, fileName, eventId });
    console.log(`Extracted: ${fileName} (${eventId})`);
  } catch (error) {
    throw new Error(`Error processing ${link}: ${error}`);
  }
}

weekends.sort((a, b) => a.index - b.index);

await Bun.write(`${import.meta.dir}/meta/motogp.json`, JSON.stringify(weekends, null, 2));

console.log('Scraping complete!');

await browser.close();
