import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Keep this preview independent of database settings inherited from other apps.
const server = spawn('python', ['manage.py', 'runserver', '127.0.0.1:8011'], {
  cwd: fileURLToPath(new URL('..', import.meta.url)),
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: process.env.PORTFOLIO_PREVIEW_DATABASE_URL || 'sqlite:///db.sqlite3',
    DJANGO_DEBUG: 'True',
  },
});

server.on('error', error => {
  console.error(`Impossible de lancer Django : ${error.message}`);
  process.exitCode = 1;
});
server.on('exit', code => { process.exitCode = code ?? 0; });
