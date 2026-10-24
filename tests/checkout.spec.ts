import { test, expect } from '@playwright/test';

test.describe('Customer Checkout Flow', () => {
  
  test('should complete a Dine-In Cash order successfully', async ({ page }) => {
    // 1. Visit the menu with a table number
    await page.goto('/en/menu?table=5');

    // 2. Verify the Dine-In banner is visible
    await expect(page.getByText(/You are ordering for Table 5/i)).toBeVisible({ timeout: 15000 });

    // 3. Add the first available item to the cart
    const firstMenuItem = page.locator('main div.grid > div').first();
    const addToCartBtn = firstMenuItem.locator('button').last();
    await addToCartBtn.click();

    // 4. Open the Cart and Proceed to Checkout
    const checkoutBtn = page.getByRole('link', { name: /proceed to checkout/i }).or(
      page.getByRole('button', { name: /proceed to checkout/i })
    );
    await checkoutBtn.first().click();

    // 5. Wait for the Checkout page to load
    await page.waitForURL('**/checkout');

    // 6. Fill out the Checkout Form
    await page.fill('input[name="guestName"]', 'Playwright Tester');
    await page.fill('input[name="guestEmail"]', 'test@lumiere.com');
    
    // The phone and address fields should be HIDDEN because of the Table 5 query param.
    await expect(page.locator('input[name="guestPhone"]')).not.toBeVisible();
    await expect(page.locator('textarea[name="deliveryAddress"]')).not.toBeVisible();

    // 7. Select Cash Payment
    const cashBtn = page.getByRole('button', { name: /pay by cash/i });
    await cashBtn.click();

    // 8. Submit the Order
    const payNowBtn = page.getByRole('button', { name: /pay now/i });
    await payNowBtn.click();

    // 9. Verify we land on the Success Page
    // We wait for the text instead of the URL to account for Next.js dev compilation time
    await expect(page.getByText(/Payment Successful!/i)).toBeVisible({ timeout: 30000 });
  });

});