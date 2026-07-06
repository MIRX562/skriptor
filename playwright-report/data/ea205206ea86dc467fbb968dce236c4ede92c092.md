# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow E2E >> should show validation errors on empty form submission
- Location: e2e/auth.spec.ts:14:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Invalid email')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Invalid email')

```

```yaml
- banner:
  - link "logo Skriptor":
    - /url: /
    - img "logo"
    - text: Skriptor
  - button "🇺🇸 Toggle language"
  - button "Toggle theme"
- main:
  - text: Welcome back Login with your Google account
  - button "Login with Google":
    - img
    - text: Login with Google
  - text: Or continue with Email
  - textbox "Email":
    - /placeholder: skriptor@mail.com
  - paragraph: Enter your email.
  - paragraph: "Invalid input: expected string, received undefined"
  - text: Password
  - textbox "Password":
    - /placeholder: "*******"
  - button "Show password" [disabled]
  - paragraph: Enter your password.
  - paragraph: "Invalid input: expected string, received undefined"
  - button "Login"
  - text: Don't have an account?
  - link "Sign up":
    - /url: /sign-up
  - text: By clicking continue, you agree to our
  - link "Terms of Service":
    - /url: "#"
  - text: and
  - link "Privacy Policy":
    - /url: "#"
  - text: .
  - paragraph:
    - text: Need help?
    - link "Contact Support":
      - /url: /contact
- contentinfo:
  - paragraph: © 2023 Skriptor. All rights reserved.
  - link "Terms":
    - /url: /terms
  - link "Privacy":
    - /url: /privacy
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Authentication Flow E2E", () => {
  4  |   test("should load the landing page and navigate to sign-in", async ({ page }) => {
  5  |     await page.goto("/");
  6  |     await expect(page.locator("header")).toContainText("Skriptor");
  7  | 
  8  |     // Click Sign In link
  9  |     await page.click("a[href='/sign-in']");
  10 |     await expect(page).toHaveURL("/sign-in");
  11 |     await expect(page.locator("body")).toContainText("Sign In");
  12 |   });
  13 | 
  14 |   test("should show validation errors on empty form submission", async ({ page }) => {
  15 |     await page.goto("/sign-in");
  16 |     await page.click("button[type='submit']");
  17 |     
  18 |     // Check validation error messages
> 19 |     await expect(page.locator("text=Invalid email")).toBeVisible();
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  20 |   });
  21 | 
  22 |   test("should successfully sign in with credentials and redirect to dashboard", async ({ page, context }) => {
  23 |     // Intercept session endpoints
  24 |     await page.route("**/api/auth/session", async (route) => {
  25 |       await route.fulfill({
  26 |         status: 200,
  27 |         contentType: "application/json",
  28 |         body: JSON.stringify({
  29 |           user: { id: "user-123", email: "test@example.com", name: "John Doe", plan: "pro" },
  30 |           session: { token: "mock-session-token" }
  31 |         })
  32 |       });
  33 |     });
  34 | 
  35 |     await page.route("**/api/auth/get-session", async (route) => {
  36 |       await route.fulfill({
  37 |         status: 200,
  38 |         contentType: "application/json",
  39 |         body: JSON.stringify({
  40 |           user: { id: "user-123", email: "test@example.com", name: "John Doe", plan: "pro" },
  41 |           session: { token: "mock-session-token" }
  42 |         })
  43 |       });
  44 |     });
  45 | 
  46 |     // Intercept login api calls
  47 |     await page.route("**/api/auth/sign-in/email", async (route) => {
  48 |       await context.addCookies([
  49 |         {
  50 |           name: "better-auth.session_token",
  51 |           value: "mock-session-token",
  52 |           domain: "localhost",
  53 |           path: "/",
  54 |         }
  55 |       ]);
  56 |       await route.fulfill({
  57 |         status: 200,
  58 |         contentType: "application/json",
  59 |         body: JSON.stringify({
  60 |           success: true,
  61 |           user: { id: "user-123", email: "test@example.com", name: "John Doe" }
  62 |         })
  63 |       });
  64 |     });
  65 | 
  66 |     await page.route("**/api/auth/login", async (route) => {
  67 |       await context.addCookies([
  68 |         {
  69 |           name: "better-auth.session_token",
  70 |           value: "mock-session-token",
  71 |           domain: "localhost",
  72 |           path: "/",
  73 |         }
  74 |       ]);
  75 |       await route.fulfill({
  76 |         status: 200,
  77 |         contentType: "application/json",
  78 |         body: JSON.stringify({
  79 |           success: true,
  80 |           user: { id: "user-123", email: "test@example.com", name: "John Doe" }
  81 |         })
  82 |       });
  83 |     });
  84 | 
  85 |     await page.goto("/sign-in");
  86 |     await page.fill("input[type='email']", "test@example.com");
  87 |     await page.fill("input[type='password']", "password123");
  88 |     
  89 |     // Click submit
  90 |     await page.click("button[type='submit']");
  91 | 
  92 |     // Wait for redirect to dashboard
  93 |     await expect(page).toHaveURL("/dashboard");
  94 |   });
  95 | });
  96 | 
```