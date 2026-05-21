const { test, expect } = require('@playwright/test');

test.describe('NannyMeal Authentication & Email Verification Redirects', () => {

  test('Redirects unauthenticated user from protected page to index', async ({ page }) => {
    // Attempt to access dashboard directly
    await page.goto('http://localhost:5000/dashboard.html');
    
    // Should be redirected to index.html (the login page)
    await expect(page).toHaveURL(/(.*index.html|http:\/\/localhost:5000\/?$)/);
    
    // Verify that the login form is shown
    await expect(page.locator('#auth-form')).toBeVisible();
  });

  test('Redirects unauthenticated user from verify-email page to index', async ({ page }) => {
    // Attempt to access verify-email directly
    await page.goto('http://localhost:5000/verify-email.html');
    
    // Should be redirected to index.html (the login page)
    await expect(page).toHaveURL(/(.*index.html|http:\/\/localhost:5000\/?$)/);
  });

  test('Protected pages block rendering before redirecting', async ({ page }) => {
    // Access a protected page
    await page.goto('http://localhost:5000/pantry.html');
    
    // We should not see any protected content
    const pantryContent = page.locator('#pantry-container');
    if (await pantryContent.count() > 0) {
      await expect(pantryContent).not.toBeVisible();
    }
    
    // Should end up on index.html
    await expect(page).toHaveURL(/(.*index.html|http:\/\/localhost:5000\/?$)/);
  });

});
