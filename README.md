# notion-vercel-blog

Notion をデータソースに、**独自ドメインで無料運営**できるブログが出来ます。  
TypeScript と Next.js 初心者ですが、AI の助けを借りて形にしました。  
コードやデザインの改善提案は大歓迎です。自由に改変してもらえると嬉しいです📖  

This project aims to create a blog using **Notion** as the data source, hosted on a **custom domain** at no cost.  
Though I'm new to **TypeScript** and **Next.js**, I managed to build it with the help of AI.  
There's still plenty of room for improvement, so feel free to modify or refactor as you like✨  

---

## ✨ 機能概要

- **Notion データの取得**  
  - Notion API を通して記事情報を取得し、公開日やステータスでフィルタ  
  - **対応ブロック**: `paragraph`, `heading_1`, `heading_2`, `heading_3`, `numbered_list_item`, `bulleted_list_item`, `quote`, `image`  
  - **非対応ブロック**:   それ以外。`fold`（折りたたみ）などは未サポート  
- **🚀 トップページ**  
  - SSR で記事一覧を表示（ページネーション機能付き）
- **📖 個別ページ**  
  - SSG + ISR を用いてビルド後に静的ページを生成し、一定時間ごとに再生成  
  - 前後の記事や関連記事の表示に対応
- **🔍 OGP**  
  - OGP画像は Next.js/Canvas の機能によって自動生成


## 📝 必要な Notion プロパティ

- **Title**: 記事タイトルを指定  
- **Status**: 「公開」の値を設定して公開可否を管理  
- **Published Date**: 公開日を管理  
- **Category**: カテゴリを指定（関連記事に使用されます）  
- **Tags**: 複数のタグを指定  
- **Slug**: 個別ページのパスとなる文字列  
- **Summary**: 記事概要や抜粋  

詳細は実際のデータベースページを参考にしてください。  
[notion-vercel-blog SampleDatabase](https://likelive.notion.site/1a50b819239d80c2a0b6d0e7a1490896?v=1a50b819239d80a7ba09000cb82c0b07)

---

## 🔧 技術要件

- **Node.js** 16 以上
- **Next.js** 15 以上
- **TypeScript**
- **Vercel アカウント**


## 🔑 環境変数

- **NOTION_API_KEY**  
  Notion の Integration で発行した秘密鍵  
  - [Notion - インテグレーションの追加と管理](https://www.notion.com/ja/help/add-and-manage-connections-with-the-api)
- **NOTION_DATABASE_ID**  
  対象データベースの ID


## 💻 セットアップ手順

デプロイまでの詳細な手順はブログで公開します。（執筆中）  

1. **リポジトリをクローン**  
  ```bash
   git clone https://github.com/your-repo/notion-vercel-blog.git
   cd notion-vercel-blog
  ```
2. **依存関係をインストール**
```bash
npm install
```
3. **環境変数を設定**
`.env.local` などに `NOTION_API_KEY` と `NOTION_DATABASE_ID` を記載  
```
NOTION_API_KEY=APIKEY_HERE
NOTION_DATABASE_ID=DATABASE_ID_HERE
```
4. **開発サーバーを起動**
```bash
npm run dev
```
5. **ブラウザで http://localhost:3000 にアクセス**

## 🚀 デプロイ方法
Git リポジトリにプッシュして Vercel と連携  
または Vercel CLI (vercel --prod) で手動デプロイ  
環境変数は Vercel の Project Settings → Environment Variables で登録してください  

サイト名や説明、1ページの表示件数は `src/config/index.ts` で設定します。  

---

## 🎨 フォントについて
LINE Seed を適用しています。  
個人的にとても気に入っているフォントで、読みやすさとデザイン性を両立しています。  
利用時は必ずライセンスを確認してください。  
[https://seed.line.me/](https://seed.line.me/)  

