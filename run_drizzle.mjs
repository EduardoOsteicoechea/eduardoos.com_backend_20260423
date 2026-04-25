import { spawn } from 'child_process';

const child = spawn('npx', ['drizzle-kit', 'generate', '--config', 'drizzle.config.ts'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

child.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  if (output.includes('Is username column')) {
    // Send Down Arrow (\x1B\x5B\x42) and Enter (\r)
    child.stdin.write('\x1B\x5B\x42\r');
  } else if (output.includes('Is reset_password_token column') || output.includes('Is reset_password_expires column')) {
    // Just send Enter to select "create column"
    child.stdin.write('\r');
  }
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('exit', (code) => {
  console.log('Exited with code', code);
});
