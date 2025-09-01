#!/usr/bin/env node
const fs = require('fs');

const SANDBOX_ENV_PATH = 'subprojects/scc-frontend-build-configurations/sandbox/.env';
const LOCAL_ENV_PATH = '.env.local';

console.log('🔄 Syncing .env.local from sandbox environment...');

if (!fs.existsSync(SANDBOX_ENV_PATH)) {
  console.error(`❌ File not found: ${SANDBOX_ENV_PATH}`);
  process.exit(1);
}

// 1. Copy sandbox .env to .env.local
let content = fs.readFileSync(SANDBOX_ENV_PATH, 'utf8');

// 2. Replace FLAVOR=sandbox with FLAVOR=local
content = content.replace(/^FLAVOR=.*$/m, 'FLAVOR=local');

// Write to .env.local
fs.writeFileSync(LOCAL_ENV_PATH, content);

console.log(`✅ Successfully synced ${LOCAL_ENV_PATH} from ${SANDBOX_ENV_PATH}`);
console.log('📝 BASE_URL will be set dynamically based on platform (iOS: localhost:8080, Android: 10.0.2.2:8080)');