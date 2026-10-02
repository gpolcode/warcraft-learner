// The WCL client pair reaches the bundle only as the `define`d constants passed here, so a bare `ng` build ships none.
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
