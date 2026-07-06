import { test, expect } from "@playwright/test";

test.describe("Authentication Flow E2E", () => {
  test("should load the landing page and navigate to sign-in", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toContainText("Skriptor");

    // Click Sign In link
    await page.click("a[href='/sign-in']");
    await expect(page).toHaveURL("/sign-in");
    await expect(page.locator("body")).toContainText("Sign In");
  });

  test("should show validation errors on empty form submission", async ({ page }) => {
    await page.goto("/sign-in");
    await page.click("button[type='submit']");
    
    // Check validation error messages
    await expect(page.locator("text=Invalid email")).toBeVisible();
  });

  test("should successfully sign in with credentials and redirect to dashboard", async ({ page, context }) => {
    // Intercept session endpoints
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

    await page.route("**/api/auth/get-session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { id: "user-123", email: "test@example.com", name: "John Doe", plan: "pro" },
          session: { token: "mock-session-token" }
        })
      });
    });

    // Intercept login api calls
    await page.route("**/api/auth/sign-in/email", async (route) => {
      await context.addCookies([
        {
          name: "better-auth.session_token",
          value: "mock-session-token",
          domain: "localhost",
          path: "/",
        }
      ]);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: { id: "user-123", email: "test@example.com", name: "John Doe" }
        })
      });
    });

    await page.route("**/api/auth/login", async (route) => {
      await context.addCookies([
        {
          name: "better-auth.session_token",
          value: "mock-session-token",
          domain: "localhost",
          path: "/",
        }
      ]);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: { id: "user-123", email: "test@example.com", name: "John Doe" }
        })
      });
    });

    await page.goto("/sign-in");
    await page.fill("input[type='email']", "test@example.com");
    await page.fill("input[type='password']", "password123");
    
    // Click submit
    await page.click("button[type='submit']");

    // Wait for redirect to dashboard
    await expect(page).toHaveURL("/dashboard");
  });
});
