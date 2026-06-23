'use strict';
// Patches Angular CLI to accept Node 22.22.2 (one patch below the CLI's stated minimum of 22.22.3).
// Runs automatically via the "postinstall" npm script after every npm install.
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'node_modules/@angular/cli/src/utilities/node-version.js');
if (!fs.existsSync(file)) {
  console.log('patch-ng-node: node-version.js not found, skipping');
  process.exit(0);
}
let content = fs.readFileSync(file, 'utf8');
if (content.includes("'^22.22.2")) {
  console.log('patch-ng-node: already patched');
  process.exit(0);
}
content = content.replace(
  "'^22.22.3 || ^24.15.0 || >=26.0.0'",
  "'^22.22.2 || ^24.15.0 || >=26.0.0'"
);
fs.writeFileSync(file, content);
console.log('patch-ng-node: patched Angular CLI to accept Node 22.22.2');
