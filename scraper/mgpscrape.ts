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

const weekends: { index: number; link: string; fileName: string; filePath: string }[] = [];

async function fetchAndSavePage(link: string, index: number): Promise<void> {
  if (!link) return;

  const page = await browser.newPage();
  await page.emulateTimezone('Europe/London');

  try {
    console.log(`Visiting ${index + 1}/${weekendLinks.length}: ${link}`);

    await page.goto(link, {
      waitUntil: 'networkidle2',
      timeout: 0,
    });

    const content = await page.content();

    const urlPath = new URL(link).pathname;
    const fileName = urlPath.split('/').at(-2)!;
    const filePath = `${import.meta.dir}/html/motogp/${fileName}.html`;

    weekends.push({ index, link, fileName, filePath });
    await Bun.write(filePath, content);
    console.log(`Saved: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${link}:`, error);
  } finally {
    await page.close();
  }
}

const BATCH_SIZE = 5;

for (let i = 0; i < weekendLinks.length; i += BATCH_SIZE) {
  const batch = weekendLinks.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map((link, batchIndex) => fetchAndSavePage(link, i + batchIndex)));
}

weekends.sort((a, b) => a.index - b.index);

await Bun.write(`${import.meta.dir}/meta/motogp.json`, JSON.stringify(weekends, null, 2));

console.log('Scraping complete!');

await browser.close();
