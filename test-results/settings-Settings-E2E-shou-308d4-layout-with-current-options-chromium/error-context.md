# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: settings.spec.ts >> Settings E2E >> should render settings layout with current options
- Location: e2e/settings.spec.ts:62:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Profile Settings"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    - waiting for" http://localhost:3000/dashboard" navigation to finish...
    - navigated to "http://localhost:3000/dashboard"

```

```yaml
- banner:
  - link "logo Skriptor":
    - /url: /
    - img "logo"
    - text: Skriptor
  - tablist:
    - tab "Dashboard" [selected]
    - tab "Transcribe"
    - tab "Manage"
  - button "🇺🇸 Toggle language"
  - button "Toggle theme"
- main:
  - heading "Dashboard" [level=2]
  - text: Total Transcriptions
  - paragraph: All time
  - text: Hours Processed
  - paragraph: Total audio transcribed
  - text: Usage
  - progressbar
  - paragraph: of 10h plan
  - link "New Transcription Start Now Upload or record audio":
    - /url: /dashboard/transcribe
    - text: New Transcription Start Now
    - paragraph: Upload or record audio
  - text: Recent Transcriptions Your latest transcription activities Transcriptions by Month Your transcription volume over time
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Settings E2E", () => {
  4  |   test.beforeEach(async ({ context, page }) => {
  5  |     // Inject mock session cookie
  6  |     await context.addCookies([
  7  |       {
  8  |         name: "better-auth.session_token",
  9  |         value: "mock-session-token",
  10 |         domain: "localhost",
  11 |         path: "/",
  12 |       }
  13 |     ]);
  14 | 
  15 |     // Mock session
  16 |     await page.route("**/api/auth/session", async (route) => {
  17 |       await route.fulfill({
  18 |         status: 200,
  19 |         contentType: "application/json",
  20 |         body: JSON.stringify({
  21 |           user: { id: "user-123", email: "test@example.com", name: "John Doe" }
  22 |         })
  23 |       });
  24 |     });
  25 | 
  26 |     // Mock settings fetch
  27 |     await page.route("**/api/settings", async (route) => {
  28 |       if (route.request().method() === "GET") {
  29 |         await route.fulfill({
  30 |           status: 200,
  31 |           contentType: "application/json",
  32 |           body: JSON.stringify({
  33 |             success: true,
  34 |             data: {
  35 |               theme: "system",
  36 |               emailNotifications: true,
  37 |               pushNotifications: false,
  38 |               defaultLanguage: "en",
  39 |               preferences: {}
  40 |             }
  41 |           })
  42 |         });
  43 |       } else if (route.request().method() === "PATCH") {
  44 |         await route.fulfill({
  45 |           status: 200,
  46 |           contentType: "application/json",
  47 |           body: JSON.stringify({
  48 |             success: true,
  49 |             data: {
  50 |               theme: "dark",
  51 |               emailNotifications: false,
  52 |               pushNotifications: true,
  53 |               defaultLanguage: "en",
  54 |               preferences: {}
  55 |             }
  56 |           })
  57 |         });
  58 |       }
  59 |     });
  60 |   });
  61 | 
  62 |   test("should render settings layout with current options", async ({ page }) => {
  63 |     await page.goto("/settings");
  64 | 
  65 |     // Check header and settings options are visible
> 66 |     await expect(page.locator("h1")).toContainText("Profile Settings");
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  67 |     await expect(page.locator("text=Full Name")).toBeVisible();
  68 |     await expect(page.locator("text=Email Address")).toBeVisible();
  69 |   });
  70 | });
  71 | 
```