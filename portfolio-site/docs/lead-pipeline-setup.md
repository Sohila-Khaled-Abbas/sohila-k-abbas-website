# Portfolio lead pipeline setup

The repository now contains the same-origin lead endpoint and its bound Google Apps Script source. The live webhook remains inactive until the Google Sheet is prepared, the Apps Script web app is deployed, and the two Vercel environment variables are configured.

## 1. Create the Google Sheet

1. Create a Google Sheet, for example **Portfolio Leads**.
2. Rename its first tab to **Leads** (case-sensitive).
3. Leave the tab empty. The script creates this header row on the first accepted submission:

   Timestamp | Name | Email | Project | Budget | Source page | Type | Status | Notes

Do not add real customer data to a test row. The automated tests use fixtures and never connect to the spreadsheet.

## 2. Add the bound Apps Script

1. Open the Sheet and choose **Extensions → Apps Script**.
2. Replace the starter contents of the Code.gs editor with the complete source in **scripts/google-apps-script/LeadWebhook.gs**.
3. Save the project.
4. Open **Project Settings → Script Properties** and add:
   - Property: LEAD_WEBHOOK_SECRET
   - Value: the same long random secret that will be stored in Vercel. Use at least 32 characters.

Generate a private value in PowerShell with:

    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $secret = [Convert]::ToBase64String($bytes)
    $secret

Keep the generated value private. Paste it into Script Properties and Vercel's encrypted environment-variable settings only. Do not put it in Code.gs, GitHub, or any client-side field.

## 3. Deploy the Web App

1. In Apps Script, choose **Deploy → New deployment**.
2. Select **Web app**.
3. Set **Execute as** to **Me** (the account that owns the Sheet).
4. Set **Who has access** to **Anyone** (anonymous access, so the Vercel server can reach it without a Google sign-in). Access is publicly reachable; the shared secret is checked for every accepted POST.
5. Deploy, review the requested Sheet and Mail permissions, and authorize them.
6. Copy the deployed URL. It should look like:
   https://script.google.com/macros/s/DEPLOYMENT_ID/exec

Use the deployed /exec URL, not the Apps Script editor link or a /dev test URL. Google documents the available web app deployment settings and execution identities in its Web Apps guide:
https://developers.google.com/apps-script/guides/web

## 4. Add the two Vercel environment variables

Open the **sohila-khaled-abbas** project in Vercel and go to **Settings → Environment Variables**. Add both as encrypted/sensitive project variables:

- LEAD_WEBHOOK_URL = the deployed Apps Script /exec URL
- LEAD_WEBHOOK_SECRET = the exact same random value saved in Apps Script Script Properties

Select **Preview** and **Production** for both variables. Development is optional if you want to test through a local Vercel runtime. Do not add the values to source files, a committed .env file, or GitHub Actions.

Vercel applies environment-variable changes to new deployments, so create a fresh Preview deployment and then redeploy Production after saving them. See:
https://vercel.com/docs/environment-variables

## 5. Verify the end-to-end flow

1. Open the deployed /services/ page and submit a real inquiry with your own test contact details.
2. Confirm one row appears in the Leads tab with Status set to New.
3. Confirm the owner notification arrives at sohila.k.data@gmail.com.
4. Reply to the owner notification and confirm its Reply-To points to the lead's email.
5. If a row is stored but the email notification fails, the Notes cell records that failure. The lead is still recorded; a resend is not attempted automatically.

The automated tests never call the deployed Apps Script URL and never send mail. Playwright uses Test User and test@example.com against an intercepted /api/lead route with a mocked response.

## Protection notes

- The server checks same-origin submission and validates all submitted fields again.
- The hidden honeypot and minimum completion time are lightweight anti-spam signals. The time value is browser-supplied, so it can be forged by a determined client; it is not a cryptographic proof or DDoS control.
- The server converts the request IP to an HMAC-SHA256 key using the shared secret. Only the one-way hash is sent to Apps Script; the raw IP is not sent or stored.
- Apps Script checks the shared secret and uses ScriptLock to coordinate concurrent requests. ScriptCache supports rate limits and short-lived deduplication, but cache entries may be evicted early. Treat this as best-effort spam reduction, not durable abuse prevention.
- The sheet is used to record an inquiry and the owner is notified. No respondent auto-reply is sent.
- The privacy line on both forms is: **Your details are used only to reply to the inquiry.**
