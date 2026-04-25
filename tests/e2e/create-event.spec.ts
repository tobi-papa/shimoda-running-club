import { test, expect } from "@playwright/test";

test.describe("Create event flow", () => {
  test("NEW RUN button opens modal", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.getByRole("button", { name: /NEW RUN/ }).first().click();
    await expect(page.getByText("NEW RUN").nth(1)).toBeVisible();
    await expect(page.getByPlaceholder("Who's organizing?")).toBeVisible();
  });

  test("submit is disabled until required fields filled", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.getByRole("button", { name: /NEW RUN/ }).first().click();
    const submit = page.getByRole("button", { name: "CREATE RUN →" });
    await expect(submit).toBeDisabled();
  });

  test("creates event and shows it in upcoming", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.getByRole("button", { name: /NEW RUN/ }).first().click();

    await page.getByPlaceholder("Who's organizing?").fill("TestRunner");
    await page.locator('input[type="datetime-local"]').fill("2026-06-01T08:00");
    await page.getByPlaceholder("Where do we meet?").fill("Main gate");
    await page.locator('input[type="number"]').fill("10");
    await page.getByPlaceholder("5:30").fill("5:00");

    await page.getByRole("button", { name: "CREATE RUN →" }).click();
    await expect(page.getByText("Main gate")).toBeVisible();
  });
});
