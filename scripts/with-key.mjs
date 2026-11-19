
// 使い方: node scripts/with-key.mjs <コマンド>
// gpg のポップアップでパスフレーズを入力 → dotenvx の鍵を復号 → コマンドを実行
import { execFileSync, spawn } from 'node:child_process';
import os from 'node:os';
 
const keyFile = '.dotenvx.key.gpg';
 
let key;
try {
  key = execFileSync('gpg', ['-dq', '--no-symkey-cache', keyFile], { stdio: ['ignore', 'pipe', 'inherit'] })
    .toString()
    .trim();
} catch {
  console.error('鍵を復号できませんでした（キャンセル・パスフレーズ違い・gpg 未インストールのいずれか）');
  process.exit(1);
}
 
spawn(process.argv.slice(2).join(' '), { stdio: 'inherit', shell: true, env: { ...process.env, DOTENV_PRIVATE_KEY_LOCAL: key } })
  .on('exit', (code) => process.exit(code ?? 1));
 