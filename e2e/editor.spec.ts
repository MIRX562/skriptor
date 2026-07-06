import { test, expect } from "@playwright/test";

test.describe("Transcription Editor E2E", () => {
  const transId = "test-trans-123";

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

    // Mock transcription details
    await page.route(`**/api/transcription/${transId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: transId,
            title: "Project Sync",
            status: "completed",
            model: "turbo",
            isSpeakerDiarized: true,
            numberOfSpeaker: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: "user-123",
            speakers: [
              { index: 1, label: "Speaker 1" },
              { index: 2, label: "Speaker 2" }
            ],
            segments: [
              {
                id: "seg-1",
                startTime: 0,
                endTime: 3000,
                speakerIndex: 1,
                text: "Welcome to the project sync meeting.",
                transcriptionId: transId
              },
              {
                id: "seg-2",
                startTime: 3200,
                endTime: 6500,
                speakerIndex: 2,
                text: "Thanks, let us discuss the timeline.",
                transcriptionId: transId
              }
            ]
          }
        })
      });
    });

    // Mock segments saving
    await page.route(`**/api/transcription/${transId}/segments`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true })
      });
    });

    // Mock settings fetch (transcription view loads settings on mount)
    await page.route("**/api/settings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            theme: "system",
            emailNotifications: true,
            pushNotifications: true,
            defaultLanguage: "en",
            preferences: {
              completedTours: {
                dashboard: true,
                editor: true
              }
            }
          }
        })
      });
    });
  });

  test("should render segments and toolbar in transcription view", async ({ page }) => {
    await page.goto(`/dashboard/manage/${transId}`);

    // Check title and segments
    await expect(page.getByRole("heading", { name: "Project Sync" })).toBeVisible();
    await expect(page.locator("text=Welcome to the project sync meeting.")).toBeVisible();
    await expect(page.locator("text=Thanks, let us discuss the timeline.")).toBeVisible();

    // Check action buttons in toolbar
    await expect(page.locator("button:has-text('Edit')")).toBeVisible();
    await expect(page.locator("button:has-text('Export')")).toBeVisible();
  });

  test("should support editing segments and saving", async ({ page }) => {
    await page.goto(`/dashboard/manage/${transId}`);

    // Click Edit button
    await page.click("button:has-text('Edit')");

    // Locate the first segment textarea (placeholder is "Enter segment text...")
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveValue("Welcome to the project sync meeting.");

    // Fill with new text
    await textarea.fill("Welcome to the project sync meeting edited.");

    // Click Save Changes button
    await page.click("button:has-text('Save Changes')");

    // The textareas should be closed, and the updated text should be visible as plain text
    await expect(page.locator("text=Welcome to the project sync meeting edited.")).toBeVisible();
  });
});
