# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: editor.spec.ts >> Transcription Editor E2E >> should render segments and toolbar in transcription view
- Location: e2e/editor.spec.ts:105:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Project Sync' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Project Sync' })

```

```yaml
- banner:
  - link "logo Skriptor":
    - /url: /
    - img "logo"
    - text: Skriptor
  - tablist:
    - tab "Dashboard"
    - tab "Transcribe"
    - tab "Manage" [selected]
  - button "🇺🇸 Toggle language"
  - button "Toggle theme"
- main:
  - button
  - text: Project Sync 5/23/2026 • 00:00
  - link "Original Audio":
    - /url: /api/transcription/test-trans-123/audio?download=true
  - button "Re-transcribe"
  - button "Delete"
  - text: Loading audio player...
  - tablist:
    - tab "Segments" [selected]
    - tab "Read Mode"
  - button "Download"
  - button "Search"
  - button "Spellcheck"
  - button "Manage Speakers"
  - button "Edit"
  - text: 00:00 Speaker 1
  - paragraph: Welcome to the project sync meeting.
  - text: 00:03 Speaker 2
  - paragraph: Thanks, let us discuss the timeline.
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  9   |       {
  10  |         name: "better-auth.session_token",
  11  |         value: "mock-session-token",
  12  |         domain: "localhost",
  13  |         path: "/",
  14  |       }
  15  |     ]);
  16  | 
  17  |     // Mock session
  18  |     await page.route("**/api/auth/session", async (route) => {
  19  |       await route.fulfill({
  20  |         status: 200,
  21  |         contentType: "application/json",
  22  |         body: JSON.stringify({
  23  |           user: { id: "user-123", email: "test@example.com", name: "John Doe" }
  24  |         })
  25  |       });
  26  |     });
  27  | 
  28  |     // Mock transcription details
  29  |     await page.route(`**/api/transcription/${transId}`, async (route) => {
  30  |       await route.fulfill({
  31  |         status: 200,
  32  |         contentType: "application/json",
  33  |         body: JSON.stringify({
  34  |           success: true,
  35  |           data: {
  36  |             id: transId,
  37  |             title: "Project Sync",
  38  |             status: "completed",
  39  |             model: "turbo",
  40  |             isSpeakerDiarized: true,
  41  |             numberOfSpeaker: 2,
  42  |             createdAt: new Date().toISOString(),
  43  |             updatedAt: new Date().toISOString(),
  44  |             userId: "user-123",
  45  |             speakers: [
  46  |               { index: 1, label: "Speaker 1" },
  47  |               { index: 2, label: "Speaker 2" }
  48  |             ],
  49  |             segments: [
  50  |               {
  51  |                 id: "seg-1",
  52  |                 startTime: 0,
  53  |                 endTime: 3000,
  54  |                 speakerIndex: 1,
  55  |                 text: "Welcome to the project sync meeting.",
  56  |                 transcriptionId: transId
  57  |               },
  58  |               {
  59  |                 id: "seg-2",
  60  |                 startTime: 3200,
  61  |                 endTime: 6500,
  62  |                 speakerIndex: 2,
  63  |                 text: "Thanks, let us discuss the timeline.",
  64  |                 transcriptionId: transId
  65  |               }
  66  |             ]
  67  |           }
  68  |         })
  69  |       });
  70  |     });
  71  | 
  72  |     // Mock segments saving
  73  |     await page.route(`**/api/transcription/${transId}/segments`, async (route) => {
  74  |       await route.fulfill({
  75  |         status: 200,
  76  |         contentType: "application/json",
  77  |         body: JSON.stringify({ success: true })
  78  |       });
  79  |     });
  80  | 
  81  |     // Mock settings fetch (transcription view loads settings on mount)
  82  |     await page.route("**/api/settings", async (route) => {
  83  |       await route.fulfill({
  84  |         status: 200,
  85  |         contentType: "application/json",
  86  |         body: JSON.stringify({
  87  |           success: true,
  88  |           data: {
  89  |             theme: "system",
  90  |             emailNotifications: true,
  91  |             pushNotifications: true,
  92  |             defaultLanguage: "en",
  93  |             preferences: {
  94  |               completedTours: {
  95  |                 dashboard: true,
  96  |                 editor: true
  97  |               }
  98  |             }
  99  |           }
  100 |         })
  101 |       });
  102 |     });
  103 |   });
  104 | 
  105 |   test("should render segments and toolbar in transcription view", async ({ page }) => {
  106 |     await page.goto(`/dashboard/manage/${transId}`);
  107 | 
  108 |     // Check title and segments
> 109 |     await expect(page.getByRole("heading", { name: "Project Sync" })).toBeVisible();
      |                                                                       ^ Error: expect(locator).toBeVisible() failed
  110 |     await expect(page.locator("text=Welcome to the project sync meeting.")).toBeVisible();
  111 |     await expect(page.locator("text=Thanks, let us discuss the timeline.")).toBeVisible();
  112 | 
  113 |     // Check action buttons in toolbar
  114 |     await expect(page.locator("button:has-text('Edit')")).toBeVisible();
  115 |     await expect(page.locator("button:has-text('Export')")).toBeVisible();
  116 |   });
  117 | 
  118 |   test("should support editing segments and saving", async ({ page }) => {
  119 |     await page.goto(`/dashboard/manage/${transId}`);
  120 | 
  121 |     // Click Edit button
  122 |     await page.click("button:has-text('Edit')");
  123 | 
  124 |     // Locate the first segment textarea (placeholder is "Enter segment text...")
  125 |     const textarea = page.locator("textarea").first();
  126 |     await expect(textarea).toBeVisible();
  127 |     await expect(textarea).toHaveValue("Welcome to the project sync meeting.");
  128 | 
  129 |     // Fill with new text
  130 |     await textarea.fill("Welcome to the project sync meeting edited.");
  131 | 
  132 |     // Click Save Changes button
  133 |     await page.click("button:has-text('Save Changes')");
  134 | 
  135 |     // The textareas should be closed, and the updated text should be visible as plain text
  136 |     await expect(page.locator("text=Welcome to the project sync meeting edited.")).toBeVisible();
  137 |   });
  138 | });
  139 | 
```