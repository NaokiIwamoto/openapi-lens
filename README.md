# Swagger Viewer

ウェブページ内のOpenAPI/Swagger YMLデータを自動検出し、Redocを使用して美しく視覚化するChrome拡張機能です。APIドキュメントを簡単に閲覧・操作できます。

## 主な機能

- **自動検出**: ウェブページ内のpreタグとtextareaタグからOpenAPI/Swagger YMLデータを自動的に検出
- **視覚化**: 検出したデータをRedocを使用して美しく整形されたドキュメントとして表示
- **ステータス表示**: 拡張機能のアイコンの状態でOpenAPIデータの有無を視覚的に表示
  - 通常アイコン: OpenAPIデータが検出された状態
  - グレーアイコン: OpenAPIデータが未検出の状態

## インストール方法

### 開発版のインストール

1. このリポジトリをクローン
```bash
git clone [repository-url]
cd Swagger-Viewer
```

2. 依存関係をインストール
```bash
bun install
```

3. 開発用ビルドを実行
```bash
bun run dev
```

4. Chromeで拡張機能をインストール
   - Chromeで `chrome://extensions` を開く
   - 「デベロッパーモード」を有効化
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - `build/chrome-mv3-prod` ディレクトリを選択

## 使用方法

1. OpenAPI/Swagger YMLデータを含むウェブページを開く
2. 拡張機能のアイコンが通常の色に変わるのを確認（データが検出されたことを示します）
3. アイコンをクリックしてビューワーを開く
4. Redocで整形されたAPIドキュメントを閲覧

## 開発方法

開発サーバーを起動：

```bash
bun run dev
```

ソースコードを編集すると、自動的に開発ビルドが更新されます。

### プロジェクト構造

- `background.ts`: バックグラウンドスクリプト（データの管理と通信を担当）
- `content.tsx`: コンテンツスクリプト（ページ内のOpenAPIデータを検出）
- `popup.tsx`: ポップアップUI
- `tabs/viewer.tsx`: Redocビューワーページ
- `assets/`: アイコンファイル

## ビルド方法

プロダクションビルドを作成：

```bash
bun run build
```

ビルドされた拡張機能は `build/chrome-mv3-prod` ディレクトリに生成されます。

## 技術スタック

- [Plasmo](https://docs.plasmo.com/): Chrome拡張機能フレームワーク
- [Redoc](https://github.com/Redocly/redoc): OpenAPI/Swaggerドキュメント視覚化ツール
- [js-yaml](https://github.com/nodeca/js-yaml): YAMLパーサー
- [Bun](https://bun.sh/): 高速なJavaScriptランタイムとパッケージマネージャー
- React: UIフレームワーク
- TypeScript: 型安全な開発環境
