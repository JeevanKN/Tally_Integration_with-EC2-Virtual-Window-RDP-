// services/tallyService.js
const axios = require('axios');
const xml2js = require('xml2js');
const { TALLY_URL, COMPANY_NAME, TIMEOUT_MS } = require('../config/tally');

// ─────────────────────────────────────────
// HELPER: Send XML to Tally, get response
// ─────────────────────────────────────────
async function sendToTally(xmlBody) {
  try {
    const response = await axios.post(TALLY_URL, xmlBody, {
      headers: { 'Content-Type': 'text/xml' },
      timeout: TIMEOUT_MS,
    });
    const parsed = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      ignoreAttrs: false,
    });
    return { success: true, raw: response.data, parsed };
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
      throw new Error('Cannot reach TallyPrime. Make sure Tally is running on EC2 with port 9000 enabled.');
    }
    throw new Error(`Tally request failed: ${err.message}`);
  }
}

// ─────────────────────────────────────────
// 1. GET COMPANIES
// ─────────────────────────────────────────
async function getCompanies() {
  const xml = `
    <ENVELOPE>
      <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>EXPORT</TALLYREQUEST>
        <TYPE>COLLECTION</TYPE>
        <ID>List of Companies</ID>
      </HEADER>
      <BODY>
        <DESC>
          <STATICVARIABLES>
            <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
          </STATICVARIABLES>
        </DESC>
      </BODY>
    </ENVELOPE>`;
  return sendToTally(xml);
}

// ─────────────────────────────────────────
// 2. GET LEDGERS
// ─────────────────────────────────────────
async function getLedgers() {
  const xml = `
    <ENVELOPE>
      <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>EXPORT</TALLYREQUEST>
        <TYPE>COLLECTION</TYPE>
        <ID>List of Ledgers</ID>
      </HEADER>
      <BODY>
        <DESC>
          <STATICVARIABLES>
            <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            <SVCURRENTCOMPANY>${COMPANY_NAME}</SVCURRENTCOMPANY>
          </STATICVARIABLES>
        </DESC>
      </BODY>
    </ENVELOPE>`;
  return sendToTally(xml);
}


// ─────────────────────────────────────────
// 3. CREATE SALES INVOICE
// ─────────────────────────────────────────
async function createSalesInvoice(invoiceData) {
  const { date, voucherNumber, partyLedger, salesLedger, narration, totalAmount } = invoiceData;

  // Convert YYYYMMDD to DD-MMM-YYYY for Tally
  const year  = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day   = date.substring(6, 8);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const tallyDate = date;

  console.log('TALLY DATE FORMAT:', tallyDate); // should print: 12-Mar-2026

  const xml = `<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${COMPANY_NAME}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE>
          <VOUCHER ACTION="Create" VCHTYPE="Sales">
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <DATE>${tallyDate}</DATE>
            <VOUCHERNUMBER>${voucherNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${partyLedger}</PARTYLEDGERNAME>
            <NARRATION>${narration || ''}</NARRATION>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${partyLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${totalAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${salesLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${totalAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
  console.log('XML BEING SENT:\n', xml);
  const result = await sendToTally(xml);
  console.log('TALLY RAW RESPONSE:', result.raw);
  const isSuccess = result.raw.includes('<CREATED>1</CREATED>');
  return { ...result, invoiceCreated: isSuccess };
}
module.exports = { getCompanies, getLedgers, createSalesInvoice };