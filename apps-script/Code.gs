// ============================================================
// Backing Young Britain — Google Apps Script
// Handles: form submissions, welcome emails, campaign updates,
//          unsubscribe links, and auto-retry for large lists.
// ============================================================

// --- CONFIGURATION -----------------------------------------------------------

var SHEET_NAME = 'Sheet1'; // Change if your sheet tab has a different name
var SENDER_NAME = 'Backing Young Britain';
var SITE_URL = 'https://backingyoungbritain.co.uk';

// The deployed web app URL (needed for unsubscribe links).
// After deploying, paste your URL here:
var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby_FSh7a33hpoLHuJpWApgjrh5Lm53zTf_ENOuON_GWlWMD6nk-7qwdtaTK1QMai2hS/exec';

// Column indices (1-based) — adjust if your sheet layout differs
var COL_TIMESTAMP = 1;        // A
var COL_FULL_NAME = 2;        // B
var COL_EMAIL = 3;            // C
var COL_POSTCODE = 4;         // D
var COL_UNSUB_TOKEN = 5;      // E
var COL_UNSUBSCRIBED = 6;     // F
var COL_WELCOME_SENT = 7;     // G
var COL_LAST_CAMPAIGN_ID = 8; // H

// Gmail daily send limit (Google Workspace = 1500, free Gmail = 100)
var MAX_EMAILS_PER_RUN = 1400; // Safety margin below the 1,500 limit

// --- CAMPAIGN UPDATE CONFIG --------------------------------------------------
// Edit these values before each campaign send:

var CAMPAIGN_ID = 'update-2026-04'; // Unique ID per campaign — change each time
var CAMPAIGN_SUBJECT = 'Campaign Update — Backing Young Britain';
var CAMPAIGN_BODY = '<p>Hello {{NAME}},</p>'
  + '<p>Here is your latest update from Backing Young Britain...</p>'
  + '<p>[Write your campaign update content here]</p>'
  + '<p>Thank you for standing with us.</p>'
  + '<p>— The Backing Young Britain Team</p>';


// =============================================================================
// FORM SUBMISSION HANDLER
// =============================================================================

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  var fullName = e.parameter.fullName || '';
  var email = e.parameter.email || '';
  var postcode = e.parameter.postcode || '';
  var timestamp = new Date();
  var unsubToken = Utilities.getUuid();

  // Append the row with all columns
  sheet.appendRow([
    timestamp,
    fullName,
    email,
    postcode,
    unsubToken,
    '',  // F: Unsubscribed (empty = subscribed)
    '',  // G: Welcome Email Sent
    ''   // H: Last Campaign Email ID
  ]);

  // Send welcome email (non-blocking — signup succeeds even if email fails)
  try {
    sendWelcomeEmail(email, fullName, unsubToken);
    // Mark welcome email as sent on the row we just appended
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, COL_WELCOME_SENT).setValue('YES');
  } catch (err) {
    console.log('Welcome email failed for ' + email + ': ' + err.message);
  }

  return ContentService.createTextOutput('OK');
}


// =============================================================================
// UNSUBSCRIBE HANDLER
// =============================================================================

function doGet(e) {
  var action = (e.parameter.action || '').toLowerCase();
  var token = e.parameter.token || '';

  if (action === 'unsubscribe' && token) {
    return processUnsubscribe(token);
  }

  // Default: return a simple info page
  return HtmlService.createHtmlOutput(
    '<html><body style="font-family:sans-serif;text-align:center;padding:60px 20px">'
    + '<h2>Backing Young Britain</h2>'
    + '<p>Visit <a href="' + SITE_URL + '">backingyoungbritain.org</a></p>'
    + '</body></html>'
  );
}

function processUnsubscribe(token) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) { // skip header row
    if (data[i][COL_UNSUB_TOKEN - 1] === token) {
      sheet.getRange(i + 1, COL_UNSUBSCRIBED).setValue('YES');

      return HtmlService.createHtmlOutput(
        '<html><body style="font-family:sans-serif;text-align:center;padding:60px 20px">'
        + '<h2>You have been unsubscribed</h2>'
        + '<p>You will no longer receive emails from Backing Young Britain.</p>'
        + '<p>If this was a mistake, you can sign up again at '
        + '<a href="' + SITE_URL + '">' + SITE_URL + '</a>.</p>'
        + '</body></html>'
      );
    }
  }

  return HtmlService.createHtmlOutput(
    '<html><body style="font-family:sans-serif;text-align:center;padding:60px 20px">'
    + '<h2>Link not recognised</h2>'
    + '<p>This unsubscribe link is not valid or has already been processed.</p>'
    + '</body></html>'
  );
}


// =============================================================================
// WELCOME EMAIL
// =============================================================================

function sendWelcomeEmail(email, fullName, unsubToken) {
  var unsubUrl = SCRIPT_URL + '?action=unsubscribe&token=' + unsubToken;
  var firstName = fullName.split(' ')[0];

  var body = '<p style="font-family:Lora,Georgia,Times,serif;font-size:30px;text-align:left;margin:8px 0 24px">Thank you, <span style="font-family:Lora,Georgia,Times,serif;font-weight:600;color:#E04B2D">' + firstName + '</span></p>'
    + '<p>Thank you for adding your name to <strong>Backing Young Britain</strong>.</p>'
    + '<p>We\'ll keep you updated on the campaign\'s progress, including when we deliver our open letter to Number 10. By signing, you\'ve joined others across the country calling for:</p>'
    + '<ul>'
    + '<li><strong>A National Strategy for Young People:</strong> Requiring government to deliver targets for under-30s across education, employment, housing, and health.</li>'
    + '<li><strong>A Commissioner for Young People:</strong> An independent voice to hold government accountable on the issues shaping the lives of those under 30.</li>'
    + '<li><strong>A Generational Impact Assessment on all major legislation:</strong> So no law passes without asking: what does this mean for the next generation?</li>'
    + '</ul>'
    + '<p>In the meantime, the single most powerful thing you can do is <strong>share the campaign</strong> with at least one other person - <a href="' + SITE_URL + '" style="color:#E04B2D;font-weight:bold">backingyoungbritain.co.uk</a></p>'
    + '<p style="margin-top:24px">Thank you,<br><span style="font-family:Lora,Georgia,Times,serif;font-style:italic;display:inline-block;margin-top:6px">Max from Backing Young Britain</span></p>';

  var htmlBody = getEmailHtml(body, unsubUrl);

  GmailApp.sendEmail(email, 'Share the campaign', '', {
    htmlBody: htmlBody,
    name: SENDER_NAME
  });
}


// =============================================================================
// CAMPAIGN UPDATE — BULK SEND
// =============================================================================

/**
 * Sends the campaign email to all active subscribers who haven't received
 * this campaignId yet. Stops at MAX_EMAILS_PER_RUN.
 * Returns the number of remaining (unsent) subscribers.
 */
function sendCampaignUpdate() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();
  var sentCount = 0;
  var remaining = 0;

  for (var i = 1; i < data.length; i++) { // skip header row
    var email = data[i][COL_EMAIL - 1];
    var unsubscribed = data[i][COL_UNSUBSCRIBED - 1];
    var lastCampaignId = data[i][COL_LAST_CAMPAIGN_ID - 1];
    var fullName = data[i][COL_FULL_NAME - 1];
    var unsubToken = data[i][COL_UNSUB_TOKEN - 1];

    // Skip: no email, unsubscribed, or already sent this campaign
    if (!email || unsubscribed === 'YES' || lastCampaignId === CAMPAIGN_ID) {
      continue;
    }

    // Check if we've hit the daily limit
    if (sentCount >= MAX_EMAILS_PER_RUN) {
      remaining++;
      continue;
    }

    // Build personalised email
    var firstName = (fullName || 'there').split(' ')[0];
    var personalisedBody = CAMPAIGN_BODY.replace(/\{\{NAME\}\}/g, firstName);
    var unsubUrl = SCRIPT_URL + '?action=unsubscribe&token=' + unsubToken;
    var htmlBody = getEmailHtml(personalisedBody, unsubUrl);

    try {
      GmailApp.sendEmail(email, CAMPAIGN_SUBJECT, '', {
        htmlBody: htmlBody,
        name: SENDER_NAME
      });

      // Mark as sent
      sheet.getRange(i + 1, COL_LAST_CAMPAIGN_ID).setValue(CAMPAIGN_ID);
      sentCount++;

      // Rate-limit: pause every 20 emails
      if (sentCount % 20 === 0) {
        Utilities.sleep(2000);
      }
    } catch (err) {
      console.log('Failed to send to ' + email + ': ' + err.message);
      // Continue to next recipient — don't abort the batch
    }
  }

  console.log('Campaign "' + CAMPAIGN_ID + '": sent ' + sentCount + ', remaining ' + remaining);

  // If all done, clean up any auto-retry triggers
  if (remaining === 0) {
    deleteAutoRetryTriggers();
  }

  return remaining;
}


// =============================================================================
// AUTO-RETRY: START CAMPAIGN WITH DAILY RETRY
// =============================================================================

/**
 * Call this to kick off a campaign. Sends the first batch immediately,
 * then schedules a daily 9am trigger to continue until complete.
 * Run from: Sheet menu > Campaign > Send Campaign Update
 */
function startCampaignWithAutoRetry() {
  var remaining = sendCampaignUpdate();

  if (remaining > 0) {
    // Check if a trigger already exists before creating a new one
    var existing = ScriptApp.getProjectTriggers();
    var alreadyScheduled = false;
    for (var i = 0; i < existing.length; i++) {
      if (existing[i].getHandlerFunction() === 'sendCampaignUpdate') {
        alreadyScheduled = true;
        break;
      }
    }

    if (!alreadyScheduled) {
      ScriptApp.newTrigger('sendCampaignUpdate')
        .timeBased()
        .everyDays(1)
        .atHour(9)
        .create();
      console.log('Scheduled daily retry for remaining ' + remaining + ' subscribers.');
    }

    SpreadsheetApp.getUi().alert(
      'Campaign started!\n\n'
      + 'Sent to the first batch today.\n'
      + remaining + ' subscribers remaining — these will be sent automatically at 9am each day until complete.'
    );
  } else {
    SpreadsheetApp.getUi().alert(
      'Campaign complete!\n\n'
      + 'All active subscribers have received the "' + CAMPAIGN_ID + '" email.'
    );
  }
}

/**
 * Removes all auto-retry triggers for sendCampaignUpdate.
 * Called automatically when a campaign finishes sending to all subscribers.
 */
function deleteAutoRetryTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'sendCampaignUpdate') {
      ScriptApp.deleteTrigger(triggers[i]);
      console.log('Auto-retry trigger removed — campaign complete.');
    }
  }
}


// =============================================================================
// CAMPAIGN STATUS CHECK
// =============================================================================

function checkCampaignStatus() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();
  var total = 0;
  var sent = 0;
  var unsubscribed = 0;

  for (var i = 1; i < data.length; i++) {
    var email = data[i][COL_EMAIL - 1];
    if (!email) continue;

    if (data[i][COL_UNSUBSCRIBED - 1] === 'YES') {
      unsubscribed++;
      continue;
    }

    total++;
    if (data[i][COL_LAST_CAMPAIGN_ID - 1] === CAMPAIGN_ID) {
      sent++;
    }
  }

  var remaining = total - sent;

  SpreadsheetApp.getUi().alert(
    'Campaign: "' + CAMPAIGN_ID + '"\n\n'
    + 'Active subscribers: ' + total + '\n'
    + 'Sent: ' + sent + '\n'
    + 'Remaining: ' + remaining + '\n'
    + 'Unsubscribed: ' + unsubscribed
  );
}


// =============================================================================
// SPREADSHEET MENU
// =============================================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Campaign')
    .addItem('Send Campaign Update', 'startCampaignWithAutoRetry')
    .addItem('Check Campaign Status', 'checkCampaignStatus')
    .addSeparator()
    .addItem('Retry Failed Welcome Emails', 'retryFailedWelcomeEmails')
    .addToMenu();
}


// =============================================================================
// RETRY FAILED WELCOME EMAILS
// =============================================================================

/**
 * Finds rows where Welcome Email Sent (col G) is empty and sends the
 * welcome email. Useful if some emails failed during signup.
 */
function retryFailedWelcomeEmails() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();
  var retried = 0;

  for (var i = 1; i < data.length; i++) {
    var email = data[i][COL_EMAIL - 1];
    var welcomeSent = data[i][COL_WELCOME_SENT - 1];
    var fullName = data[i][COL_FULL_NAME - 1];
    var unsubToken = data[i][COL_UNSUB_TOKEN - 1];

    if (email && !welcomeSent && unsubToken) {
      try {
        sendWelcomeEmail(email, fullName, unsubToken);
        sheet.getRange(i + 1, COL_WELCOME_SENT).setValue('YES');
        retried++;
      } catch (err) {
        console.log('Retry failed for ' + email + ': ' + err.message);
      }
    }
  }

  SpreadsheetApp.getUi().alert('Retried ' + retried + ' welcome email(s).');
}


// =============================================================================
// HTML EMAIL TEMPLATE
// =============================================================================

/**
 * Wraps email body content in a branded HTML template.
 * Uses inline CSS only (Gmail strips <style> tags).
 */
function getEmailHtml(bodyContent, unsubscribeUrl) {
  return '<!DOCTYPE html>'
    + '<html><head><meta charset="utf-8"></head>'
    + '<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:30px 0">'
    + '<tr><td align="center">'

    // Main container
    + '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;max-width:600px;width:100%">'

    // Body
    + '<tr><td style="padding:32px 32px 24px;font-size:15px;line-height:1.6;color:#000000;font-family:Arial,Helvetica,sans-serif">'
    + bodyContent
    + '</td></tr>'

    // Footer
    + '<tr><td style="padding:20px 32px 28px;font-size:13px;color:#000000;font-family:Arial,sans-serif;border-top:1px solid #eee;text-align:left;font-style:italic">'
    + 'You received this email because you signed the Backing Young Britain campaign. '
    + '<a href="' + unsubscribeUrl + '" style="color:#000000;text-decoration:underline;font-style:italic">Unsubscribe from campaign emails</a>'
    + '</td></tr>'

    + '</table>'

    + '</td></tr></table>'
    + '</body></html>';
}
