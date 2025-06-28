これはナタクラゲのブログシステムです。カスタマイズすればだれでも使えます。

## 使用技術
- Next.js
- Contentful
- TailwindCSS
- DaisyUI

## 使い方

### インストール

```bash
npm install
```

### Contentfulの設定

#### Content model

##### blogPost
ブログの記事を表現

| フィールド | 型 | 説明 | 必須 |
| --------- | --- | ---- | ---- |
| title | Short Text | タイトル | 必須、タイトル |
| image | Media | 画像 |  |
| slug | Short Text | Slug | 必須、一意 |
| show_toc | Boolean | 目次を表示するか？ | 必須 |
| body | Long Text | 本文 | 必須 |
| license | Long Text | 作者 | 必須 |

##### postList
記事をまとめたリストを表現

| フィールド | 型 | 説明 | 必須 |
| --------- | --- | ---- | ---- |
| title | Short Text | タイトル | 必須、タイトル |
| posts | References, many | 記事 | 必須 |
| description | Long Text | 説明 | |

### プレビュー
プレビュー用URLは

(Origin)/api/preview?slug={entry.fields.slug}&secret=(プレビュー用シークレット（後述）)

と設定してください。

### 環境変数

以下を設定してください。

| 環境変数 | 説明 |
|:--------| ---- |
|CONTENTFUL_SPACE_ID | ContentfulのSpace ID |
|CONTENTFUL_ACCESS_TOKEN | ContentfulのContent Delivery APIトークン |
|CONTENTFUL_PREVIEW_ACCESS_TOKEN | ContentfulのContent Preview APIトークン |
|CONTENTFUL_PREVIEW_SECRET | プレビュー用シークレット（任意の文字列） |
|HOST | ホスト名（RSS用） |

### プロフィールなど
プロフィール等の情報はsrc/app/data/data.jsonに記述します。

## ライセンス

このプロジェクトのコードは~MIT ライセンス~ ~GPLv3（2024/12/15変更）~ AGPLv3（2025/06/28再変更）の下で提供されています。詳細は `LICENSE` ファイルをご参照ください。

ただし、`public` ディレクトリ内のアセット（画像など）は [Ceative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/) ライセンスで提供されています。詳細は `public/LICENSE` をご確認ください。

## TODO

- [x] Add RSS feed
- [x] Add Embed Card
- [ ] Add Google Analytics?
- [x] コンテンツとプログラムの分離（？）
