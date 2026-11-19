// 使い方: node scripts/with-key.mjs <コマンド>
// 暗号化された .env.local があるときだけ、gpg のポップアップでパスフレーズを入力して鍵を復号する。
// .env.local がない環境（Vercel などのホスティングや CI）では、そのままコマンドを実行する。
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import os from 'node:os';

const keyFile = '.dotenvx.key.gpg';
const env = { ...process.env };

const needsKey = existsSync('.env.local') && readFileSync('.env.local', 'utf8').includes('encrypted:');

if (needsKey) {
  try {
    env.DOTENV_PRIVATE_KEY_LOCAL = execFileSync('gpg', ['-dq', '--no-symkey-cache', keyFile], {
      stdio: ['ignore', 'pipe', 'inherit'],
    })
      .toString()
      .trim();
  } catch {
    console.error('鍵を復号できませんでした（キャンセル・パスフレーズ違い・gpg 未インストールのいずれか）');
    process.exit(1);
  }
}

spawn(process.argv.slice(2).join(' '), { stdio: 'inherit', shell: true, env })
  .on('exit', (code) => process.exit(code ?? 1));
 