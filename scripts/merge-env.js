#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const result = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        result[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return result;
}

function writeEnvFile(filePath, envVars) {
  const content = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(filePath, content);
}

// Parse arguments
const baseEnvPath = process.argv[2];
const localEnvPath = process.argv[3];
const outputPath = process.argv[4];

if (!baseEnvPath || !localEnvPath || !outputPath) {
  console.error('Usage: node merge-env.js <base-env-path> <local-env-path> <output-path>');
  process.exit(1);
}

// Merge env files
const baseEnv = parseEnvFile(baseEnvPath);
const localEnv = parseEnvFile(localEnvPath);
const mergedEnv = { ...baseEnv, ...localEnv };

// Write merged env file
writeEnvFile(outputPath, mergedEnv);
console.log(`Merged env files: ${baseEnvPath} + ${localEnvPath} -> ${outputPath}`);