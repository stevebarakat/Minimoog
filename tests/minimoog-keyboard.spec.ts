import { test, expect } from "@playwright/test";

test("Keyboard Interaction: clicking and pressing keys triggers notes", async ({
  page,
}) => {
  await page.goto("http://localhost:5173");

  // Enable the synth by clicking the PowerButton
  const powerButton = await page.getByTestId("power-button");
  await powerButton.click();

  // Wait for the C4 key to become enabled
  const c4Key = await page.getByTestId("key-C4");
  await expect(c4Key).toBeEnabled();

  // Click the key
  await c4Key.click();

  // Check for visual feedback
  await expect(c4Key).toHaveClass(/whiteKeyActive/i);
});
