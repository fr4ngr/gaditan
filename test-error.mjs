import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

  await page.goto('https://cadiz-taxi.pages.dev/');
  
  // Wait a bit to let the initial message fetch complete
  await page.waitForTimeout(3000);
  const botMsg = await page.locator('.message.bot').first().innerText();
  console.log('BOT MESSAGE:', botMsg);

  await browser.close();
})();
