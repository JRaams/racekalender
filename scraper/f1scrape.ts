import puppeteer from 'puppeteer-core';
import type { F1WeekendMeta } from './types';

console.log('Launching browser...');

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/brave-browser',
});

const overviewPage = await browser.newPage();
await overviewPage.emulateTimezone('Europe/London');

console.log('Navigating to overview...');

await overviewPage.goto('https://www.formula1.com/en/racing/2026', {
  waitUntil: 'networkidle0',
});

const roundLinks = await overviewPage.evaluate(() => {
  const links: string[] = [];
  const roundElements = Array.from(document.querySelectorAll('#maincontent span')).filter((span: any) =>
    span.textContent?.toLowerCase().includes('round'),
  );

  roundElements.forEach((span: any) => {
    // Find the parent link element
    const link = span.closest('a[href]');
    if (link) {
      const href = link.href;
      if (href && !links.includes(href)) {
        links.push(href);
      }
    }
  });

  return links;
});

console.log(`Found ${roundLinks.length} round links`);
await overviewPage.close();

const weekends: F1WeekendMeta[] = [];

async function fetchAndSavePage(link: string, index: number): Promise<void> {
  if (!link) return;

  const page = await browser.newPage();
  await page.emulateTimezone('Europe/London');

  try {
    console.log(`Visiting ${index + 1}/${roundLinks.length}: ${link}`);

    await page.goto(link, {
      waitUntil: 'networkidle2',
    });

    const content = await page.content();

    const urlPath = new URL(link).pathname;
    const fileName = urlPath.split('/').pop()!;
    const filePath = `${import.meta.dir}/html/f1/${fileName}.html`;

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

for (let i = 0; i < roundLinks.length; i += BATCH_SIZE) {
  const batch = roundLinks.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map((link, batchIndex) => fetchAndSavePage(link, i + batchIndex)));
}

weekends.sort((a, b) => a.index - b.index);

await Bun.write(`${import.meta.dir}/meta/f1.json`, JSON.stringify(weekends, null, 2));

console.log('Scraping complete!');

await browser.close();
