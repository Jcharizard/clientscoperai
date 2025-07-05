#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Clear error log on startup
const LOGS_DIR = path.join(__dirname, 'logs');
const ERROR_LOG = path.join(LOGS_DIR, 'scrape_errors.log');

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Clear previous error log
try {
  fs.writeFileSync(ERROR_LOG, '');
  console.log('✅ Cleared error log');
} catch (e) {
  console.error('Failed to clear error log:', e);
}

// Start the main server
require('./index.cjs'); 