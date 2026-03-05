const { test, expect } = require('@playwright/test');

test.describe('NannyMeal E2E Audit', () => {

  test('Structural sanity check - Index', async ({ page }) => {
    // Go to the initial page
    await page.goto('/index.html');
    
    // The page should have the correct PWA title
    await expect(page).toHaveTitle(/NannyMeal/);
    
    // Check if the auth layout wrapper exists (indicating structural integrity)
    await expect(page.locator('.app-container')).toBeVisible();
    
    // Check if the main title exists
    await expect(page.locator('#auth-title')).toContainText('Bem-vindo');
  });

});
