import { test, expect } from "@playwright/test";

test.describe("Settings E2E", () => {
  test.beforeEach(async ({ context, page }) => {
    // Inject mock session cookie
    await context.addCookies([
      {
        name: "better-auth.session_token",
        value: "mock-session-token",
        domain: "localhost",
        path: "/",
      }
    ]);

    // Mock session
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { id: "user-123", email: "test@example.com", name: "John Doe" }
        })
      });
    });

    // Mock settings fetch
    await page.route("**/api/settings", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              theme: "system",
              emailNotifications: true,
              pushNotifications: false,
              defaultLanguage: "en",
              preferences: {}
            }
          })
        });
      } else if (route.request().method() === "PATCH") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              theme: "dark",
              emailNotifications: false,
              pushNotifications: true,
              defaultLanguage: "en",
              preferences: {}
            }
          })
        });
      }
    });
  });

  test("should render settings layout with current options", async ({ page }) => {
    await page.goto("/settings");

    // Check header and settings options are visible
    await expect(page.locator("h1")).toContainText("Profile Settings");
    await expect(page.locator("text=Full Name")).toBeVisible();
    await expect(page.locator("text=Email Address")).toBeVisible();
  });
});
