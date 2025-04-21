import { expect, test } from '@playwright/test';

test.describe('home', () => {
  test('has title2', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(10000);
    // Expect h1 to contain a substring.
    expect(await page.locator('h1').innerText()).toContain('Welcome');
  });
});
