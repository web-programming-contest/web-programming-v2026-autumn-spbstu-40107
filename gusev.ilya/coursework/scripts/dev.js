const {spawn} = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [
  spawn(process.execPath, ['backend/server.js'], {cwd: root, stdio: 'inherit'}),
  spawn(npm, ['run', 'dev', '--prefix', 'frontend'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) {
    return;
  }
  stopping = true;
  children.forEach((child) => child.kill('SIGTERM'));
  setTimeout(() => process.exit(code), 300);
}
children.forEach((child) => {
  child.on('error', (err) => {
    console.error(err.message);
    stop(1);
  });
  child.on('exit', (code) => stop(code || 0));
});
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
