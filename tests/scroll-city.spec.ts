import { test, expect } from '@playwright/test';

test('City modal list is scrollable', async ({ page }) => {
  await page.goto('/');

  // Wait for the UI to be ready
  await page.waitForTimeout(1000);

  // Click the weather header toggle to open the city modal
  // Note: The toggle button contains the text "EL CLIMA HOY EN"
  await page.locator('button', { hasText: 'EL CLIMA HOY EN' }).click();

  // Wait for the modal to be visible
  const cityModal = page.locator('#city-modal');
  await expect(cityModal).toBeVisible();

  // Give the modal animation time to finish
  await page.waitForTimeout(500);

  // Get the city-list element
  const cityList = page.locator('#city-list');

  // Verify that the element has overflow-y: scroll or auto
  const overflowY = await cityList.evaluate((el) => window.getComputedStyle(el).overflowY);
  expect(['auto', 'scroll']).toContain(overflowY);

  // Evaluate the scroll dimensions
  const dimensions = await cityList.evaluate((el) => {
    return {
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      scrollTop: el.scrollTop,
    };
  });

  // Verify that scrollHeight > clientHeight (meaning it HAS scrollable content)
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);

  // Programmatically simulate a scroll down
  await cityList.evaluate((el) => {
    el.scrollTop = 100;
  });

  // Wait to allow potential scroll events to fire
  await page.waitForTimeout(100);

  // Verify the scrollTop actually changed (meaning it is actively scrollable)
  const newScrollTop = await cityList.evaluate((el) => el.scrollTop);
  expect(newScrollTop).toBeGreaterThan(0);
});
