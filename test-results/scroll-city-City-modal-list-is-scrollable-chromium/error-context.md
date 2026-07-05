# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scroll-city.spec.ts >> City modal list is scrollable
- Location: tests\scroll-city.spec.ts:3:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/
Call log:
  - navigating to "http://localhost:4321/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('City modal list is scrollable', async ({ page }) => {
> 4  |   await page.goto('/');
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/
  5  | 
  6  |   // Wait for the UI to be ready
  7  |   await page.waitForTimeout(1000);
  8  | 
  9  |   // Click the weather header toggle to open the city modal
  10 |   // Note: The toggle button contains the text "EL CLIMA HOY EN"
  11 |   await page.locator('button', { hasText: 'EL CLIMA HOY EN' }).click();
  12 | 
  13 |   // Wait for the modal to be visible
  14 |   const cityModal = page.locator('#city-modal');
  15 |   await expect(cityModal).toBeVisible();
  16 | 
  17 |   // Give the modal animation time to finish
  18 |   await page.waitForTimeout(500);
  19 | 
  20 |   // Get the city-list element
  21 |   const cityList = page.locator('#city-list');
  22 | 
  23 |   // Verify that the element has overflow-y: scroll or auto
  24 |   const overflowY = await cityList.evaluate((el) => window.getComputedStyle(el).overflowY);
  25 |   expect(['auto', 'scroll']).toContain(overflowY);
  26 | 
  27 |   // Evaluate the scroll dimensions
  28 |   const dimensions = await cityList.evaluate((el) => {
  29 |     return {
  30 |       scrollHeight: el.scrollHeight,
  31 |       clientHeight: el.clientHeight,
  32 |       scrollTop: el.scrollTop,
  33 |     };
  34 |   });
  35 | 
  36 |   // Verify that scrollHeight > clientHeight (meaning it HAS scrollable content)
  37 |   expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);
  38 | 
  39 |   // Programmatically simulate a scroll down
  40 |   await cityList.evaluate((el) => {
  41 |     el.scrollTop = 100;
  42 |   });
  43 | 
  44 |   // Wait to allow potential scroll events to fire
  45 |   await page.waitForTimeout(100);
  46 | 
  47 |   // Verify the scrollTop actually changed (meaning it is actively scrollable)
  48 |   const newScrollTop = await cityList.evaluate((el) => el.scrollTop);
  49 |   expect(newScrollTop).toBeGreaterThan(0);
  50 | });
  51 | 
```