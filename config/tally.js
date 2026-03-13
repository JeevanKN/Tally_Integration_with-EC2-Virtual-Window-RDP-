// config/tally.js
const CONFIG = require('./config');

const TALLY_URL    = CONFIG.tally_url     || 'http://13.232.77.250:9000';
const COMPANY_NAME = CONFIG.tally_company || 'My Test Company';
const TIMEOUT_MS   = 10000;

module.exports = { TALLY_URL, COMPANY_NAME, TIMEOUT_MS };