/**
 * Web App endpoint to append order submissions to a Google Sheet.
 * Deploy as Web App (Execute as Me; Who has access: Anyone), use the /exec URL.
 */
var SHEET_ID = (function() {
  try {
    return PropertiesService.getScriptProperties().getProperty('SHEET_ID') || 'REPLAC1ksd20xWpHcH_NWmSQJyOxK1SKAMHDFZnJnAbAqsGQGAE_WITH_YOUR_SHEET_ID';
  } catch (e) {
    return '1ksd20xWpHcH_NWmSQJyOxK1SKAMHDFZnJnAbAqsGQGA';
  }
})();
var SHEET_NAME = 'Orders';

function doPost(e) {
  try {
    var data = parsePayload_(e);
    var ss = openSpreadsheet_();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      new Date(),
      safe_(data.nama),
      safe_(data.email),
      safe_(data.whatsapp),
      safe_(data.whatsappNormalized),
      safe_(data.layanan),
      safe_(data.anggaran),
      safe_(data.deadline),
      safe_(data.deskripsi),
      safe_(data.lampiranName),
      safe_(data.userAgent)
    ]);
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: String(err),
      hint: 'Set SHEET_ID to the Google Spreadsheet ID (from the Sheets URL: /d/{ID}/edit). Do not use the Apps Script ID.'
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function parsePayload_(e) {
  if (!e || !e.postData) return {};
  var contents = e.postData.contents || '';
  var type = e.postData.type || '';
  // Primary: JSON string (text/plain or application/json)
  try {
    return JSON.parse(contents);
  } catch (err) {
    // Fallback: x-www-form-urlencoded
    var obj = {};
    var parts = contents.split('&');
    for (var i = 0; i < parts.length; i++) {
      var pair = parts[i];
      var idx = pair.indexOf('=');
      if (idx > -1) {
        var key = decodeURIComponent(pair.slice(0, idx));
        var value = decodeURIComponent(pair.slice(idx + 1));
        obj[key] = value;
      }
    }
    return obj;
  }
}

function safe_(v) {
  return v === undefined || v === null ? '' : String(v);
}

/**
 * Accept either a pure Spreadsheet ID or a full Spreadsheet URL in SHEET_ID.
 * If a full URL is provided, the ID between /d/ and /edit is extracted.
 */
function extractSpreadsheetId_(s) {
  if (!s) return '';
  if (s.indexOf('docs.google.com/spreadsheets') !== -1) {
    var m = s.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (m && m[1]) return m[1];
  }
  return s;
}

/**
 * Opens the target spreadsheet and throws a helpful error if the ID is wrong.
 */
function openSpreadsheet_() {
  var id = extractSpreadsheetId_(SHEET_ID);
  try {
    return SpreadsheetApp.openById(id);
  } catch (err) {
    throw new Error('Invalid SHEET_ID. Use Spreadsheet ID (from URL /d/{ID}/edit), not Apps Script ID. Current: ' + String(SHEET_ID).slice(0, 32) + '...');
  }
}

function doGet(e) {
  return ContentService.createTextOutput('ok');
}
/**
 * Utilities to configure and test the Web App from the Apps Script editor.
 * Run these functions directly from the Apps Script editor:
 * - setSpreadsheetIdDemo()  -> quickly set the SHEET_ID property (replace the placeholder first)
 * - showConfig()            -> log current SHEET_ID and extracted ID
 * - healthCheck()           -> verify the spreadsheet opens and sheet status
 * - testAppend()            -> simulate a POST with sample payload and append a row
 * - clearSpreadsheetId()    -> clear the SHEET_ID script property
 *
 * Note: Running doPost() directly from the editor without an event payload is not useful.
 * Use testAppend() instead to simulate a valid request.
 */

function setSpreadsheetIdDemo() {
  // Replace with your Spreadsheet ID from the Sheets URL:
  // https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', 'PUT_SPREADSHEET_ID_HERE');
  Logger.log('SHEET_ID set. Current: ' + PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
}

function showConfig() {
  var prop = PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '(not set)';
  Logger.log('SHEET_ID property (raw): ' + prop);
  // Uses the same extractor as doPost()
  try {
    // extractSpreadsheetId_ is defined above in this file
    var extracted = extractSpreadsheetId_(prop);
    Logger.log('Extracted ID: ' + extracted);
  } catch (e) {
    Logger.log('Extractor error: ' + e);
  }
}

function healthCheck() {
  try {
    var ss = openSpreadsheet_(); // Uses current SHEET_ID via openSpreadsheet_()
    Logger.log('Spreadsheet name: ' + ss.getName());
    var exists = ss.getSheetByName(SHEET_NAME) != null;
    Logger.log('Sheet "' + SHEET_NAME + '": ' + (exists ? 'exists' : 'will be created on first write'));
    Logger.log('Health check OK');
  } catch (e) {
    Logger.log('Health check failed: ' + e);
    throw e;
  }
}

function testAppend() {
  // Sample payload (mimics what the frontend sends)
  var payload = {
    timestamp: new Date().toISOString(),
    nama: 'Test User',
    email: 'test@example.com',
    whatsapp: '08123456789',
    whatsappNormalized: '628123456789',
    layanan: 'Website Development',
    anggaran: '1000000',
    deadline: '2025-12-31',
    deskripsi: 'Test order via testAppend()',
    lampiranName: '',
    userAgent: 'UnitTest'
  };

  // Simulate a POST event object
  var e = {
    postData: {
      contents: JSON.stringify(payload),
      type: 'application/json'
    }
  };

  var out = doPost(e); // Calls your existing handler
  try {
    Logger.log(out.getContent());
  } catch (logErr) {
    Logger.log('Response logged.');
  }
  Logger.log('testAppend() completed.');
}

function clearSpreadsheetId() {
  PropertiesService.getScriptProperties().deleteProperty('SHEET_ID');
  Logger.log('SHEET_ID cleared.');
}