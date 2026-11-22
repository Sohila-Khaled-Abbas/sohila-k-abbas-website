/**
 * Bound Google Apps Script web app for the portfolio lead pipeline.
 *
 * Set LEAD_WEBHOOK_SECRET in Project Settings > Script Properties.
 * Deploy as a web app that executes as the spreadsheet owner.
 * Respondent auto-replies are intentionally disabled.
 */
const OWNER_EMAIL = 'sohila.k.data@gmail.com';
const SHEET_NAME = 'Leads';
const HEADERS = [
  'Timestamp',
  'Name',
  'Email',
  'Project',
  'Budget',
  'Source page',
  'Type',
  'Status',
  'Notes'
];
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_SECONDS = 15 * 60;
const DEDUPE_SECONDS = 6 * 60 * 60;

function doPost(event) {
  try {
    const raw = event && event.postData && event.postData.contents || '{}';
    const payload = JSON.parse(raw);
    const expected = PropertiesService.getScriptProperties().getProperty('LEAD_WEBHOOK_SECRET') || '';
    if (!expected || !constantTimeEqual(String(payload.secret || ''), expected)) {
      return jsonOutput({ ok: false, code: 'UNAUTHORIZED' });
    }
    if (!validLeadPayload(payload)) {
      return jsonOutput({ ok: false, code: 'INVALID_PAYLOAD' });
    }

    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(5000);
    } catch (lockError) {
      return jsonOutput({ ok: false, code: 'BUSY' });
    }

    try {
      const cache = CacheService.getScriptCache();
      const duplicateKey = 'lead_' + payload.submissionId;
      const previous = cache.get(duplicateKey);
      if (previous) {
        let prior = {};
        try { prior = JSON.parse(previous); } catch (ignored) {}
        return jsonOutput({
          ok: true,
          duplicate: true,
          notificationSent: prior.notificationSent === true
        });
      }

      const rateKey = 'rate_' + payload.rateKey;
      const count = Number(cache.get(rateKey) || '0');
      if (count >= RATE_LIMIT_MAX) {
        return jsonOutput({ ok: false, code: 'RATE_LIMITED' });
      }
      cache.put(rateKey, String(count + 1), RATE_LIMIT_SECONDS);

      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      if (!spreadsheet) return jsonOutput({ ok: false, code: 'SHEET_UNAVAILABLE' });
      const sheet = spreadsheet.getSheetByName(SHEET_NAME);
      if (!sheet) return jsonOutput({ ok: false, code: 'LEADS_TAB_MISSING' });

      if (sheet.getLastRow() === 0) {
        sheet.appendRow(HEADERS);
      } else {
        const actual = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
        if (HEADERS.some(function (header, index) { return actual[index] !== header; })) {
          return jsonOutput({ ok: false, code: 'HEADER_MISMATCH' });
        }
      }

      const rowNumber = sheet.getLastRow() + 1;
      sheet.appendRow([
        new Date(),
        safeCell(payload.name),
        safeCell(payload.email),
        safeCell(payload.project),
        safeCell(payload.budget),
        safeCell(payload.sourcePage),
        safeCell(payload.type),
        'New',
        safeCell(payload.notes || '')
      ]);
      cache.put(duplicateKey, JSON.stringify({ notificationSent: false }), DEDUPE_SECONDS);

      let notificationSent = false;
      try {
        const subject = 'New lead: ' + safeSubject(payload.name) + ' - ' + safeSubject(payload.budget);
        const body = [
          'A new inquiry has been received from your portfolio.',
          '',
          'Name: ' + payload.name,
          'Email: ' + payload.email,
          'Budget: ' + payload.budget,
          'Type: ' + payload.type,
          'Source page: ' + payload.sourcePage,
          '',
          'PROJECT',
          payload.project,
          '',
          'Open the Leads tab in your connected Google Sheet to review and update the status.'
        ].join('\n');
        MailApp.sendEmail({
          to: OWNER_EMAIL,
          replyTo: payload.email,
          subject: subject,
          body: body,
          name: 'Portfolio inquiry'
        });
        notificationSent = true;
      } catch (mailError) {
        sheet.getRange(rowNumber, 9).setValue('Lead stored; owner email notification could not be sent.');
      }

      cache.put(duplicateKey, JSON.stringify({ notificationSent: notificationSent }), DEDUPE_SECONDS);
      return jsonOutput({ ok: true, notificationSent: notificationSent });
    } finally {
      lock.releaseLock();
    }
  } catch (unexpectedError) {
    return jsonOutput({ ok: false, code: 'SERVER_ERROR' });
  }
}

function validLeadPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(payload.submissionId || ''))) return false;
  if (!/^[0-9a-f]{64}$/i.test(String(payload.rateKey || ''))) return false;
  if (!['standard', 'enterprise'].includes(String(payload.type || ''))) return false;

  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const project = String(payload.project || '').trim();
  const budget = String(payload.budget || '').trim();
  const sourcePage = String(payload.sourcePage || '').trim();

  if (name.length < 2 || name.length > 100 || /[\u0000-\u001f\u007f<>]/.test(name)) return false;
  if (email.length > 254 || !/^[^\s@<>]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email) || email.indexOf('..') !== -1) return false;
  if (project.length < 25 || project.length > 5000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(project)) return false;
  if (!budget || budget.length > 120 || /[\r\n\u0000-\u001f\u007f]/.test(budget)) return false;
  if (payload.type === 'standard' && [
    '500 - 2,000 EGP',
    '2,000 - 5,000 EGP',
    '5,000 - 10,000 EGP',
    '10,000 - 25,000 EGP',
    '25,000+ EGP',
    'Not sure yet'
  ].indexOf(budget) === -1) return false;
  if (sourcePage !== '/services/') return false;
  return true;
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function safeCell(value) {
  const text = String(value == null ? '' : value).replace(/\u0000/g, '').slice(0, 5000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}
function safeSubject(value) {
  return String(value || '').replace(/[\r\n\u0000-\u001f\u007f]/g, ' ').slice(0, 120);
}
function jsonOutput(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
