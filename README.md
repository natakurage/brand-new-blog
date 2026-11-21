これはナタクラゲのブログシステムです。カスタマイズすればだれでも使えます。

## 使用技術
- Next.js
- ~Contentful~ Sanity.io
- TailwindCSS
- DaisyUI

## 使い方

### インストール

```bash
npm install
```

### Sanity.ioの設定
@types/sanity.types.tsを見て察してください。

### 環境変数

以下を設定してください。

| 環境変数 | 説明 |
|:--------| ---- |
|SANITY_PROJECT_ID | SanityのProject ID |
|SANITY_DATASET_NAME | Sanityのデータセット名 |
|SANITY_VIEWER_TOKEN | SanityのAPIトークン（閲覧者権限必須） |
|SANITY_PREVIEW_SECRET | プレビュー用シークレット（任意の文字列） |
|SANITY_WEBHOOK_SECRET | Sanity の webhook の Secret と同じ値（`/api/revalidate` が署名の照合に使う） |
|NEXT_PUBLIC_ORIGIN | サイトのオリジン |

## ライセンス

このプロジェクトのコードは~MIT ライセンス~ ~GPLv3（2024/12/15変更）~ AGPLv3（2025/06/28再変更）の下で提供されています。詳細は `LICENSE` ファイルをご参照ください。

## TODO

- [x] Add RSS feed
- [x] Add Embed Card
- [ ] Add Google Analytics?
- [x] コンテンツとプログラムの分離（？）
