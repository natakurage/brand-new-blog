// 使い方: node scripts/setup-key.mjs
// .env.keys の鍵を gpg（パスフレーズ）で暗号化 → 復号できるか確認 → .env.keys を削除
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, unlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const keyFile = '.dotenvx.key.gpg';

const key = readFileSync('.env.keys', 'utf8').match(/^DOTENV_PRIVATE_KEY_LOCAL=["']?([^"'\r\n]+)/m)?.[1];
if (!key) throw new Error('.env.keys に DOTENV_PRIVATE_KEY_LOCAL がありません（先に pnpm encrypt）');
if (existsSync(keyFile)) throw new Error(`${keyFile} がすでにあります（作り直すなら削除してから実行）`);

mkdirSync(path.dirname(keyFile), { recursive: true });
console.log('パスフレーズを決めて入力してください（2回）');
execFileSync('gpg', ['-cq', '--no-symkey-cache', '-o', keyFile], { input: key, stdio: ['pipe', 'inherit', 'inherit'] });

console.log('確認のため、もう一度パスフレーズを入力してください');
const decrypted = execFileSync('gpg', ['-dq', '--no-symkey-cache', keyFile], { stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();
if (decrypted !== key) throw new Error('復号結果が一致しません。.env.keys は残しておきます');

unlinkSync('.env.keys');
console.log(`完了: ${keyFile} を作成し、.env.keys を削除しました`);