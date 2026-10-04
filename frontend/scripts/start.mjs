// The dev build reads and writes stored WCL responses through the ingest file server, so starting the app starts both.
import { spawn } from 'child_process';
import { createRequire } from 'module';

// Run the CLI directly rather than through npx, whose wrapper process does not pass a stop signal on to ng serve.
const ngCli = createRequire(import.meta.url).resolve('@angular/cli/bin/ng.js');

const server = spawn(process.execPath, ['scripts/ingest-server.js'], { stdio: 'inherit' });
const serve = spawn(process.execPath, [ngCli, 'serve', ...process.argv.slice(2)], { stdio: 'inherit' });

// The usual cause is a file server another terminal already runs on that port, which serves the app just as well.
server.on('exit', code => {
  if (code) console.log(`[start] ingest file server exited (code ${code}); ng serve keeps running`);
});

serve.on('exit', code => {
  server.kill();
  process.exit(code ?? 1);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => serve.kill(signal));
}
