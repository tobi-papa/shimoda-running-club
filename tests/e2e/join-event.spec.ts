import { test, expect } from "@playwright/test";

test.describe("Join event flow", () => {
  test("JOIN RUN button opens dialog", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.getByRole("button", { name: "JOIN RUN →" }).first().click();
    await expect(page.getByText("JOIN RUN", { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder("Yuki, Tobi")).toBeVisible();
  });

  test("joining adds names to participant list", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.getByRole("button", { name: "JOIN RUN →" }).first().click();
    await page.getByPlaceholder("Yuki, Tobi").fill("NewRunner");
    await page.getByRole("button", { name: "JOIN →" }).click();
    await expect(page.getByText("NewRunner")).toBeVisible();
  });
});
