# Email Automation Setup — Backing Young Britain

## What this does

- **Auto thank-you email** when someone signs the petition
- **Campaign update emails** to all subscribers (with daily auto-retry for large lists)
- **One-click unsubscribe** in every email (GDPR/PECR compliant)
- **Retry failed welcome emails** from the spreadsheet menu

No changes to the website are needed. Everything runs server-side in Google Apps Script.

---

## Step 1: Add columns to your Google Sheet

Your sheet currently has columns for Timestamp, Full Name, Email, Postcode (columns A-D).

Add these headers to **row 1** of columns E through H:

| E | F | G | H |
|---|---|---|---|
| `Unsubscribe Token` | `Unsubscribed` | `Welcome Email Sent` | `Last Campaign Email ID` |

If your existing columns are in a different order, update the `COL_` constants at the top of `Code.gs` to match.

---

## Step 2: Update the Apps Script code

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. In the script editor, **replace** the entire contents of `Code.gs` with the code from the `Code.gs` file in this folder
4. Update the `SCRIPT_URL` variable (line 14) with your actual deployment URL — you'll get this in Step 4
5. Update `SHEET_NAME` if your sheet tab isn't called "Sheet1"
6. Save the file (Ctrl+S / Cmd+S)

---

## Step 3: Authorise new permissions

1. In the Apps Script editor, select `doPost` from the function dropdown at the top
2. Click **Run**
3. Google will show a permissions dialog — click **Review Permissions**
4. Select your Google Workspace account
5. You may see a "This app isn't verified" warning — click **Advanced > Go to [project name]**
6. Grant permission to **send email on your behalf** (this is the `gmail.send` scope)

---

## Step 4: Deploy

**Option A — Update existing deployment (recommended, keeps same URL):**
1. Go to **Deploy > Manage Deployments**
2. Click the **pencil icon** (edit) on your existing deployment
3. Set **Version** to "New version"
4. Click **Deploy**
5. Copy the Web App URL and paste it into the `SCRIPT_URL` variable in `Code.gs`
6. Save, then repeat steps 1-4 once more (so the code has the correct URL embedded)

**Option B — New deployment (changes the URL):**
1. Go to **Deploy > New Deployment**
2. Set type to **Web App**
3. Set "Execute as" to **Me**
4. Set "Who has access" to **Anyone**
5. Click **Deploy** and copy the URL
6. Paste the URL into `SCRIPT_URL` in `Code.gs`, save, and redeploy
7. **Also update `index.html`** — replace the old Apps Script URL on lines 8014 and 8151 with the new URL

---

## Step 5: Set up the spreadsheet menu trigger

1. In the Apps Script editor, click the **clock icon** (Triggers) in the left sidebar
2. Click **+ Add Trigger**
3. Set:
   - Function: `onOpen`
   - Event source: From spreadsheet
   - Event type: On open
4. Click **Save**

Now when you open the spreadsheet, you'll see a **Campaign** menu with:
- Send Campaign Update
- Check Campaign Status
- Retry Failed Welcome Emails

---

## Step 6: Test

### Test the welcome email:
1. Go to your website and submit the petition form with your own email
2. Check your inbox — you should receive a branded thank-you email within seconds
3. Check the Google Sheet — columns E and G should be populated on the new row
4. Check the Apps Script execution log (left sidebar > Executions) for any errors

### Test unsubscribe:
1. Click the "Unsubscribe" link in the welcome email
2. You should see a confirmation page
3. Check the sheet — column F should now say "YES" for that row

### Test campaign update:
1. Open the sheet and go to **Campaign > Send Campaign Update**
2. Check your inbox for the campaign email
3. Check column H — it should show the campaign ID
4. Run it again — no duplicate email should be sent

---

## Sending campaign updates

Each time you want to send a campaign email:

1. Open `Code.gs` in the Apps Script editor
2. Edit these three variables near the top:
   - `CAMPAIGN_ID` — a unique string for this email (e.g., `'update-2026-05'`)
   - `CAMPAIGN_SUBJECT` — the email subject line
   - `CAMPAIGN_BODY` — the HTML body (use `{{NAME}}` for the subscriber's first name)
3. Save the file
4. Open the spreadsheet and click **Campaign > Send Campaign Update**

If you have more than 1,400 subscribers, the script automatically:
- Sends the first 1,400 today
- Schedules a daily 9am retry for the remainder
- Cleans up the trigger when complete

You can check progress anytime via **Campaign > Check Campaign Status**.

---

## Limits

| Limit | Value |
|---|---|
| Emails per day (Google Workspace) | ~1,500 |
| Emails per day (free Gmail) | ~100 |
| Apps Script execution time | 6 minutes (editor run) / 30 minutes (time trigger) |
| Practical max list size | Unlimited (auto-retry handles overflow across days) |

If you need same-day delivery to 1,500+ people, or want open/click tracking and designed templates, consider migrating to [Brevo](https://www.brevo.com) (free: 300 emails/day) or [Mailchimp](https://mailchimp.com) (free: 500 contacts).
