import { execSync } from 'child_process';
const output = execSync('npx wrangler d1 execute cadiz-chat --command "SELECT COUNT(*) FROM direct_messages;" --remote', { encoding: 'utf8' });
console.log(output);
