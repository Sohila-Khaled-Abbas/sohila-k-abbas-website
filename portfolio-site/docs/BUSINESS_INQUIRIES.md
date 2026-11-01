# Verified business inquiries

The inquiry form at `/services/#business-inquiry` is approval-only. Visitors cannot self-register, mark their own business verified, change the approved identity, or prepare an inquiry without an active private invitation. The production registry starts empty; no example or test business is approved.

Public communication is through Sohila's email, LinkedIn, and GitHub. Her personal phone is absent from the current website and the preserved React contact component. The old CV archive link has been removed from the public résumé.

## Verification is a human decision

Before approving a business, Sohila reviews:

1. Its legal business name, registration country, registration reference, and an official public registry record.
2. Its official website and matching business email domain.
3. The named contact's control of that work mailbox, confirmed through an email exchange. A reply confirming a one-time phrase is one practical way to do this.
4. The proposed employment, contract, paid project, or paid technical consultation and its relevance to her work.

A website or company-looking email is not approval. Consumer and common temporary email domains cannot be used for an approved contact. Do not approve records merely because they have passed syntax checks.

## Issue an invitation after verification

Install the portable site's dependencies with `npm ci --ignore-scripts`. Create a private input file outside Git history, such as `.private/business.json`:

```json
{
  "legalName": "",
  "contactName": "",
  "email": "",
  "website": "",
  "country": "",
  "registrationReference": "",
  "registryUrl": "",
  "checks": {
    "registryChecked": false,
    "businessDomainChecked": false,
    "workEmailConfirmed": false
  }
}
```

Fill this with the actual reviewed business details. `country` is its two-letter registration country code. Set each check to `true` only after that review is complete. From `portfolio-site/`, run:

```sh
node scripts/business-access.mjs issue --record .private/business.json --verified
```

The command adds an encrypted approval to `server/business-approvals.json` and saves the private invitation in `.private/business-invitation.json`. Commit only the encrypted registry change, run checks, and deploy it through the usual pull request workflow. After the matching production deployment is ready, send the invitation privately to the confirmed work email. The command does not contact anyone.

The default lifetime is 72 hours; `--hours` accepts 1-168 hours. The invitation is bound to the production website's exact origin. It does not authorize other domains or old deployment hostnames. Its token is a random 256-bit capability: anyone holding that private link can act as the approved contact until expiry or revocation, so keep it private and send it only to the confirmed mailbox.

## Revoke access

Use the `approvalId` retained in the private invitation file:

```sh
node scripts/business-access.mjs revoke --id APPROVAL_ID
```

Deploy the registry change. Access on the current production website is then rejected, including an already-open form's next validation request.

## Enforcement and privacy

- Every `open` and `prepare` request is authorized again by the Vercel endpoint, even when JavaScript or HTML restrictions are bypassed.
- Approvals are encrypted with AES-256-GCM. The server registry contains a token hash and encrypted data; business emails, contact names, and invitation tokens are not published in plain text.
- The invitation is carried in a URL fragment, removed from the address bar after loading, and held in page memory. It is not stored in cookies or local storage.
- Only the approved contact name, legal business name, and confirmed work email are accepted. Work email remains read-only in the browser and is checked again on the server.
- Work type, focus, detailed scope, deliverables, positive compensation range, currency, timing, professional references, and a professional-purpose confirmation are validated.
- Optional requester phone numbers are parsed with `libphonenumber-js/max`, using complete international numbering metadata, and normalized to E.164. This validates the number format and numbering-plan rules; it does not prove that a person owns or answers that line. No phone number belonging to Sohila is exposed.
- Meaningless repeated text, common placeholders, obvious personal/promotional requests, malformed values, unsupported fields, honeypot entries, cross-origin browser requests, and payloads over 16 KiB are rejected. These rules do not establish that every statement in an approved contact's message is truthful.
- The API returns an email draft. It does not send email, store inquiry submissions, log request bodies, or add third-party verification/SMS services. The sender reviews and sends the draft from the confirmed work mailbox. Copying the draft is available if an email app truncates a long `mailto:` message.

No approval is made automatically by the hourly GitHub project sync. It does not edit the server registry.

## Development and checks

```sh
npm ci --ignore-scripts
npm test
npm run build
npm run check
npm run dev
```

For local browser QA, keep fixture approvals in `.private/` and set `INQUIRY_APPROVALS_FILE` in a local `.env.local` file. Issue those invitations for the exact local preview origin using `--origin`. The production function ignores that local override when running on Vercel. Never add QA records or private input/invitation files to the production registry or Git history.

Vercel serves `api/business-inquiry.mjs`. Static-only mirrors and Firebase static hosting do not provide this endpoint: public content remains available, and businesses should use invitations issued for the main production website. The form fails closed if the endpoint is unavailable.
