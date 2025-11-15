#!/usr/bin/env node
const fs = require('fs');

const SANDBOX_ENV_PATH =
  'subprojects/scc-frontend-build-configurations/sandbox/.env';
const LOCAL_ENV_PATH = '.env.local';

console.log('🔄 Syncing .env.local from sandbox environment...');

if (!fs.existsSync(SANDBOX_ENV_PATH)) {
  console.error(`❌ File not found: ${SANDBOX_ENV_PATH}`);
  process.exit(1);
}

// 1. Read existing .env.local to preserve BASE_URL if it exists
let existingBaseUrl = null;
if (fs.existsSync(LOCAL_ENV_PATH)) {
  const existingContent = fs.readFileSync(LOCAL_ENV_PATH, 'utf8');
  const baseUrlMatch = existingContent.match(/^BASE_URL=(.*)$/m);
  if (baseUrlMatch) {
    existingBaseUrl = baseUrlMatch[1];
    console.log('💾 Preserving existing BASE_URL:', existingBaseUrl);
  }
}

// 2. Copy sandbox .env to .env.local
let content = fs.readFileSync(SANDBOX_ENV_PATH, 'utf8');

// 3. Replace FLAVOR=sandbox with FLAVOR=local
content = content.replace(/^FLAVOR=.*$/m, 'FLAVOR=local');

// 4. Preserve existing BASE_URL or set default for local development
if (existingBaseUrl) {
  content = content.replace(/^BASE_URL=.*$/m, `BASE_URL=${existingBaseUrl}`);
} else {
  content = content.replace(/^BASE_URL=.*$/m, 'BASE_URL=http://localhost:8080');
}

// Write to .env.local
fs.writeFileSync(LOCAL_ENV_PATH, content);

console.log(
  `✅ Successfully synced ${LOCAL_ENV_PATH} from ${SANDBOX_ENV_PATH}`,
);
console.log(
  '📝 BASE_URL preserved or set to localhost:8080 for local development',
);
