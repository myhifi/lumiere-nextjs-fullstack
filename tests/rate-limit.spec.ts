import { test, expect } from '@playwright/test';

test.describe('Rate Limiting Security', () => {
  
  test('should block the 2nd checkout attempt within a minute', async ({ page }) => {
    // Claude's Strategy: Give each test a unique IP so Redis buckets don't overlap
    const rand = () => Math.floor(Math.random() * 255);
    const ip = `10.${rand()}.${rand()}.${rand()}`;
    await page.setExtraHTTPHeaders({ 'x-forwarded-for': ip });

    // Helper to fill out the form
    const fillFormAndSubmit = async (iteration: number) => {
      await page.fill('input[name="guestName"]', `Rate Limit Tester ${iteration}`);
      await page.fill('input[name="guestEmail"]', 'rate.limit@lumiere.com');
      
      const addressField = page.locator('textarea[name="deliveryAddress"]');
      if (await addressField.isVisible()) {
        await addressField.fill('123 Test Street');
        await page.fill('input[name="guestPhone"]', '+201234567890');
      }

      const cashBtn = page.getByRole('button', { name: /cash/i });
      await cashBtn.click();

      const payNowBtn = page.getByRole('button', { name: /pay now/i });
      await payNowBtn.click();
    };

    // 1. First Attempt (Should Succeed)
    await page.goto('/en/menu');
    await page.locator('main div.grid > div').first().locator('button').last().click();
    await page.getByRole('link', { name: /proceed to checkout/i }).or(page.getByRole('button', { name: /proceed to checkout/i })).first().click();
    await page.waitForURL('**/checkout');
    
    await fillFormAndSubmit(1);
    await page.waitForURL('**/checkout/success?*');

    // 2. Second Attempt (Should be blocked by the Rate Limiter)
    // We must add an item again because the Success page cleared the cart
    await page.goto('/en/menu');
    await page.locator('main div.grid > div').first().locator('button').last().click();
    await page.getByRole('link', { name: /proceed to checkout/i }).or(page.getByRole('button', { name: /proceed to checkout/i })).first().click();
    await page.waitForURL('**/checkout');

    await fillFormAndSubmit(2);

    // 3. Assert that the rate limit error message appears
    await expect(
      page.getByText(/Too many checkout attempts. Please try again in a minute./i)
    ).toBeVisible({ timeout: 10000 });
  });

});