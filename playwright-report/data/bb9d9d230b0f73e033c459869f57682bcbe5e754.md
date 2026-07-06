# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: editor.spec.ts >> Transcription Editor E2E >> should support editing segments and saving
- Location: e2e/editor.spec.ts:118:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text(\'Save Changes\')')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "logo Skriptor" [ref=e6] [cursor=pointer]:
          - /url: /
          - img "logo" [ref=e8]
          - generic [ref=e9]: Skriptor
        - tablist [ref=e12]:
          - tab "Dashboard" [ref=e13]:
            - img
            - text: Dashboard
          - tab "Transcribe" [ref=e14]:
            - img
            - text: Transcribe
          - tab "Manage" [selected] [ref=e15]:
            - img
            - text: Manage
        - generic [ref=e17]:
          - button "🇺🇸 Toggle language" [ref=e18]:
            - generic [ref=e19]: 🇺🇸
            - generic [ref=e20]: Toggle language
          - button "Toggle theme" [ref=e21]:
            - generic [ref=e22]:
              - img
            - generic [ref=e23]: Toggle theme
    - main [ref=e24]:
      - generic [ref=e28]:
        - generic [ref=e29]:
          - generic [ref=e30]:
            - button [ref=e31]:
              - img
            - generic [ref=e32]:
              - generic [ref=e33]: Project Sync
              - generic [ref=e34]:
                - img [ref=e35]
                - generic [ref=e38]: 5/23/2026
                - generic [ref=e39]: •
                - generic [ref=e40]: 00:00
          - generic [ref=e41]:
            - link "Original Audio" [ref=e42] [cursor=pointer]:
              - /url: /api/transcription/test-trans-123/audio?download=true
              - img
              - generic [ref=e43]: Original Audio
            - button "Re-transcribe" [ref=e44]:
              - img
              - generic [ref=e45]: Re-transcribe
            - button "Delete" [ref=e46]:
              - img
              - generic [ref=e47]: Delete
        - generic [ref=e48]:
          - generic [ref=e50]: Loading audio player...
          - generic [ref=e52]:
            - tablist [ref=e54]:
              - tab "Segments" [selected] [ref=e55]:
                - img
                - generic [ref=e56]: Segments
              - tab "Read Mode" [ref=e57]:
                - img
                - generic [ref=e58]: Read Mode
            - button "Download" [ref=e60]:
              - img
              - generic [ref=e61]: Download
              - img
            - button "Search" [ref=e62]:
              - img
              - generic [ref=e63]: Search
            - button "Spellcheck" [ref=e65]:
              - img
              - generic [ref=e66]: Spellcheck
            - button "Cancel" [ref=e68]
            - button "Save" [ref=e69]:
              - img
              - generic [ref=e70]: Save
          - generic [ref=e73]:
            - generic [ref=e76]:
              - generic [ref=e77]:
                - generic [ref=e78]: 00:00
                - combobox [ref=e80]:
                  - generic [ref=e81]:
                    - generic: Speaker 1
                  - img
              - textbox "Enter segment text..." [active] [ref=e84]: Welcome to the project sync meeting edited.
            - generic [ref=e87]:
              - generic [ref=e88]:
                - generic [ref=e89]: 00:03
                - combobox [ref=e91]:
                  - generic [ref=e92]:
                    - generic: Speaker 2
                  - img
              - textbox "Enter segment text..." [ref=e95]: Thanks, let us discuss the timeline.
  - region "Notifications alt+T"
  - generic [ref=e100] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e101]:
      - img [ref=e102]
    - generic [ref=e105]:
      - button "Open Next.js Dev Tools" [ref=e106]: Cache disabled
      - button "Collapse cache bypass badge" [ref=e107]:
        - img [ref=e108]
  - alert [ref=e110]
```

# Test source

```ts
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
  109 |     await expect(page.getByRole("heading", { name: "Project Sync" })).toBeVisible();
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
> 133 |     await page.click("button:has-text('Save Changes')");
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  134 | 
  135 |     // The textareas should be closed, and the updated text should be visible as plain text
  136 |     await expect(page.locator("text=Welcome to the project sync meeting edited.")).toBeVisible();
  137 |   });
  138 | });
  139 | 
```