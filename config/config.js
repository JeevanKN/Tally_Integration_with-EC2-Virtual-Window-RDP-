if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

let CONFIG = {};

// App
CONFIG.app  = process.env.APP  || "dev";
CONFIG.port = process.env.PORT || "3000";

// Tally
CONFIG.tally_url     = process.env.TALLY_URL     || "http://localhost:9000";
CONFIG.tally_company = process.env.TALLY_COMPANY || "My Company";

// Database
CONFIG.db_dialect     = process.env.DB_DIALECT     || "postgres";
CONFIG.db_host        = process.env.DB_HOST        || "localhost";
CONFIG.db_port        = process.env.DB_PORT        || "5432";
CONFIG.db_name        = process.env.DB_NAME        || "tally_db";
CONFIG.db_user        = process.env.DB_USER        || "postgres";
CONFIG.db_password    = process.env.DB_PASSWORD    || "db-password";
CONFIG.db_usePassword = process.env.DB_USE_PASSWORD || "true";

module.exports = CONFIG;