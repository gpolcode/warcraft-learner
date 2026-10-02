// Every `ng` build or serve runs through here, so the WCL client pair reaches the bundle as a `define`d constant and never as a committed literal.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { requireWclCredentials } from './wcl-credentials.mjs';

const NG = fileURLToPath(new URL('../node_modules/@angular/cli/bin/ng.js', import.meta.url));

const { clientId, clientSecret } = await requireWclCredentials();
// JSON.stringify yields the quoted JS string literal `define` expects.
const defines = [
  '--define', `WCL_CLIENT_ID=${JSON.stringify(clientId)}`,
  '--define', `WCL_CLIENT_SECRET=${JSON.stringify(clientSecret)}`,
];
const child = spawn(process.execPath, [NG, ...process.argv.slice(2), ...defines], { stdio: 'inherit' });
child.on('exit', (code, signal) => { process.exit(code ?? (signal ? 1 : 0)); });
