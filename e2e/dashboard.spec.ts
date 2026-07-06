import { test, expect } from "@playwright/test";

test.describe("Dashboard E2E", () => {
  test.beforeEach(async ({ context, page }) => {
    // Inject mock session cookie to satisfy middleware proxy
    await context.addCookies([
      {
        name: "better-auth.session_token",
        value: "mock-session-token",
        domain: "localhost",
        path: "/",
      }
    ]);

    // Mock better-auth session endpoint
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { id: "user-123", email: "test@example.com", name: "John Doe", plan: "pro" },
          session: { token: "mock-session-token" }
        })
      });
    });

    // Mock transcriptions endpoint
    await page.route("**/api/transcriptions", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "trans-1",
              title: "Meeting Notes",
              status: "completed",
              model: "turbo",
              createdAt: new Date().toISOString(),
              duration: 300,
            },
            {
              id: "trans-2",
              title: "Lecture audio",
              status: "processing",
              model: "large",
              createdAt: new Date().toISOString(),
              duration: 1200,
            }
          ]
        })
      });
    });
  });

  test("should render the dashboard layout with user menu and transcriptions", async ({ page }) => {
    await page.goto("/dashboard");

    // Check stats cards are visible
    await expect(page.locator("text=Total Transcriptions")).toBeVisible();

    // Check recent transcriptions table is rendered with the mock data
    await expect(page.locator("text=Meeting Notes")).toBeVisible();
    await expect(page.locator("text=Lecture audio")).toBeVisible();

    // Check statuses
    await expect(page.locator("text=completed")).toBeVisible();
    await expect(page.locator("text=processing")).toBeVisible();
  });

  test("should allow navigating to transcribe upload page", async ({ page }) => {
    await page.goto("/dashboard");
    await page.click("a[href='/dashboard/transcribe']");
    await expect(page).toHaveURL("/dashboard/transcribe");
  });
});
