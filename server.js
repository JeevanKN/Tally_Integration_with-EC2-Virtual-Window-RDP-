// server.js — Entry Point
require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');      
const CONFIG = require('./config/config');       
const v1 = require('./routes/v1');

const app = express();
app.use(express.json());

app.use('/api/v1', v1);

// ── Health Check ──
app.use('/api/healthz', async (req, res) => {
  try {
    const result = await sequelize.query(        // ✅ fix: was model.sequelize (model not imported)
      'SELECT 1+1 AS result',
      { type: sequelize.QueryTypes.SELECT }      // ✅ fix: same
    );
    return result[0].result === 2
      ? res.status(200).send('OK')
      : res.status(500).send('Database Error');
  } catch {
    return res.status(500).send('Database Error');
  }
});

// ── Start Server ──
const PORT = CONFIG.port || 3000;

sequelize.sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 Server running at: http://localhost:' + PORT);
      console.log('📡 Tally URL:         ' + CONFIG.tally_url);
      console.log('🏢 Tally Company:     ' + CONFIG.tally_company);
      console.log('🗄️  Database:          PostgreSQL → ' + CONFIG.db_name + ' on ' + CONFIG.db_host);
      console.log('');
      console.log('📋 Test endpoints:');
      console.log('   GET  http://localhost:' + PORT + '/api/v1/tally/ping');       // ✅ fix: added /v1
      console.log('   GET  http://localhost:' + PORT + '/api/v1/tally/companies');  // ✅ fix
      console.log('   GET  http://localhost:' + PORT + '/api/v1/tally/ledgers');    // ✅ fix
      console.log('   GET  http://localhost:' + PORT + '/api/v1/tally/invoices');   // ✅ fix
      console.log('   POST http://localhost:' + PORT + '/api/v1/tally/invoice');    // ✅ fix
      console.log('');
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });