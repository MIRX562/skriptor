# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow E2E >> should load the landing page and navigate to sign-in
- Location: e2e/auth.spec.ts:4:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:3000/sign-in"
Received: "http://localhost:3000/"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:3000/"

```

```yaml
- banner:
  - link "logo Skriptor":
    - /url: /
    - img "logo"
    - text: Skriptor
  - navigation:
    - link "Features":
      - /url: "#features"
    - link "Architecture":
      - /url: /architecture
    - link "FAQ":
      - /url: "#faq"
  - link "Log in":
    - /url: /sign-in
    - button "Log in"
  - link "Sign up":
    - /url: /sign-up
    - button "Sign up"
  - button "🇺🇸 Toggle language"
  - button "Toggle theme"
- text: Powered by AI
- heading "Transform Speech to Text with Precision" [level=1]
- text: Skriptor converts your audio into accurate transcriptions in seconds. Perfect for meetings, interviews, lectures, and more.
- button "Get Started Free"
- button "View Demo"
- text: Try Skriptor Now
- paragraph: Upload or record an audio file to see how fast our transcription works.
- tablist:
  - tab "Upload File" [selected]
  - tab "Record Audio"
- tabpanel "Upload File":
  - paragraph: Click to upload or drag and drop
  - paragraph: MP3, M4A, WAV, FLAC (Max 50MB)
  - button "Choose File"
- button "Transcribe Now" [disabled]
- text: Features
- heading "Everything You Need for Perfect Transcriptions" [level=2]
- paragraph: Our powerful features make transcribing audio effortless, accurate, and efficient.
- heading "High Accuracy Transcription" [level=3]
- paragraph: Industry-leading speech recognition with 98.7% accuracy across accents and languages.
- heading "Real-time Processing" [level=3]
- paragraph: Get your transcriptions in seconds, not hours. Perfect for time-sensitive content.
- heading "Multi-language Support" [level=3]
- paragraph: Support for 30+ languages and automatic language detection for multilingual content.
- heading "Speaker Identification" [level=3]
- paragraph: Automatically identify and label different speakers in your recordings.
- heading "Smart Summaries" [level=3]
- paragraph: AI-powered summaries of your transcriptions to quickly extract key information.
- heading "Custom Vocabulary" [level=3]
- paragraph: Add industry-specific terms and names to improve transcription accuracy.
- text: How It Works
- heading "Simple Process, Powerful Results" [level=2]
- paragraph: Get accurate transcriptions in three easy steps
- text: "01"
- heading "Upload Your Audio" [level=3]
- paragraph: Upload audio files or record directly in your browser. We support MP3, WAV, M4A, and more.
- text: "02"
- heading "AI Processing" [level=3]
- paragraph: Our advanced AI analyzes your audio, identifies speakers, and transcribes with high accuracy.
- text: "03"
- heading "Review & Export" [level=3]
- paragraph: Edit your transcript if needed, then export in various formats including TXT, DOCX, and SRT.
- text: FAQ
- heading "Frequently Asked Questions" [level=2]
- paragraph: Everything you need to know about Skriptor
- heading "How accurate is the transcription?" [level=3]:
  - button "How accurate is the transcription?"
- heading "What languages are supported?" [level=3]:
  - button "What languages are supported?"
- heading "How long does transcription take?" [level=3]:
  - button "How long does transcription take?"
- heading "Is my data secure?" [level=3]:
  - button "Is my data secure?"
- heading "Can I edit the transcriptions?" [level=3]:
  - button "Can I edit the transcriptions?"
- heading "What file formats are supported?" [level=3]:
  - button "What file formats are supported?"
- heading "Ready to Transform Your Audio into Text?" [level=2]
- paragraph: Join thousands of satisfied users who save time and improve productivity with Skriptor.
- button "Get Started Free"
- button "Contact Sales"
- contentinfo:
  - img "logo"
  - text: Skriptor
  - paragraph: Transform speech to text with precision and ease.
  - link:
    - /url: "#"
    - img
  - link:
    - /url: "#"
    - img
  - link:
    - /url: "#"
    - img
  - link:
    - /url: "#"
    - img
  - heading "Product" [level=3]
  - list:
    - listitem:
      - link "Features":
        - /url: "#"
    - listitem:
      - link "Pricing":
        - /url: "#"
    - listitem:
      - link "API":
        - /url: "#"
    - listitem:
      - link "Integrations":
        - /url: "#"
    - listitem:
      - link "Documentation":
        - /url: "#"
    - listitem:
      - link "Architecture":
        - /url: /architecture
  - heading "Company" [level=3]
  - list:
    - listitem:
      - link "About":
        - /url: "#"
    - listitem:
      - link "Blog":
        - /url: "#"
    - listitem:
      - link "Careers":
        - /url: "#"
    - listitem:
      - link "Press":
        - /url: "#"
    - listitem:
      - link "Contact":
        - /url: "#"
  - heading "Legal" [level=3]
  - list:
    - listitem:
      - link "Terms":
        - /url: "#"
    - listitem:
      - link "Privacy":
        - /url: "#"
    - listitem:
      - link "Cookies":
        - /url: "#"
    - listitem:
      - link "Licenses":
        - /url: "#"
    - listitem:
      - link "Settings":
        - /url: "#"
  - paragraph: © 2023 Skriptor. All rights reserved.
  - button "🇺🇸 Toggle language"
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
> 10 |     await expect(page).toHaveURL("/sign-in");
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  11 |     await expect(page.locator("body")).toContainText("Sign In");
  12 |   });
  13 | 
  14 |   test("should show validation errors on empty form submission", async ({ page }) => {
  15 |     await page.goto("/sign-in");
  16 |     await page.click("button[type='submit']");
  17 |     
  18 |     // Check validation error messages
  19 |     await expect(page.locator("text=Invalid email")).toBeVisible();
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