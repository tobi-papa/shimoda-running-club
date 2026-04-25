import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("renders hero section", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.getByText("SHIMODA", { exact: true })).toBeVisible();
    await expect(page.getByText("RUNNING", { exact: true })).toBeVisible();
    await expect(page.getByText("CLUB.", { exact: true })).toBeVisible();
  });

  test("shows upcoming and past section headings", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.getByText("UPCOMING RUNS")).toBeVisible();
    await expect(page.getByText("PAST RUNS")).toBeVisible();
  });

  test("shows seed event cards", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.getByText("Shimoda lobby — bench by the vending machines")).toBeVisible();
    await expect(page.getByText("East gate, under the red torii")).toBeVisible();
  });

  test("shows music player", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.getByText("MUTED")).toBeVisible();
  });

  test("complete button moves event to past", async ({ page }) => {
    await page.goto("http://localhost:3000");
    const completeBtns = page.getByRole("button", { name: "COMPLETE" });
    const countBefore = await completeBtns.count();
    await completeBtns.first().click();
    await expect(completeBtns).toHaveCount(countBefore - 1);
  });
});
