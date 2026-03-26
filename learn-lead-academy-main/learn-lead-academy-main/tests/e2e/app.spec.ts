import { test, expect } from "../../playwright-fixture";

test.describe("System and acceptance flows", () => {
  test("homepage smoke test", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Explore Courses")).toBeVisible();
    await expect(page.getByRole("link", { name: "Courses" }).first()).toBeVisible();
  });

  test("user can navigate to courses page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Courses" }).first().click();
    await expect(page).toHaveURL(/\/courses/);
    await expect(page.getByRole("heading", { name: "Our Courses" })).toBeVisible();
  });

  test("unknown route shows not found page", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByText("Oops! Page not found")).toBeVisible();
  });
});
