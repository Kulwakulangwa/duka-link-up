import { cpSync, existsSync } from 'fs';

if (!existsSync('dist/server')) {
  console.error('dist/server not found - build may have failed');
  process.exit(1);
}

cpSync('dist/server', 'api/server', { recursive: true });
console.log('✓ Copied dist/server → api/server');
