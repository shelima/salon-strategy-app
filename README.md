# 出店戦略情報局 — 美容室・サロン開業シミュレーター

美容室・サロンの新規開業や2店舗目出店を、データで判断するWebアプリです。

## 機能

- **エリア分析**: 駅名・市区町村名を入力するだけで、乗降客数・人口・美容室数を自動取得
- **競合分析**: 半径500m・1km内の競合店舗数・特徴を入力
- **売上シミュレーション**: メニュー・客単価・営業日数から月間売上を試算
- **損益計算**: 固定費・初期投資・損益分岐点・回収期間を自動計算
- **出店診断**: 100点採点・強み/リスク/改善提案を自動生成

## データソース

- **人口データ**: [e-Stat API](https://www.e-stat.go.jp/api/)（令和2年国勢調査）
- **駅データ**: ローカルJSONファイル（647駅・1日平均乗降客数）

## 技術構成

- **Next.js** 16（App Router）
- **TypeScript**
- **Tailwind CSS v4**
- **Zustand**（状態管理 + localStorage永続化）
- **Recharts**（グラフ）

---

## ローカル起動方法

### 1. 依存パッケージをインストール

```bash
npm install
```

### 2. 環境変数を設定

`.env.example` をコピーして `.env.local` を作成します。

```bash
cp .env.example .env.local
```

`.env.local` を開き、`ESTAT_APP_ID=` の後に取得したAPIキーを入力してください。

```
ESTAT_APP_ID=ここにAPIキーを貼り付け
```

> **e-Stat APIキーの取得方法**
> 1. [https://www.e-stat.go.jp/api/](https://www.e-stat.go.jp/api/) にアクセス
> 2. 無料アカウントを登録
> 3. マイページ → アプリケーション登録 → 発行されたIDをコピー

### 3. 開発サーバーを起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) で起動します。

---

## GitHubへのアップロード方法

```bash
# GitHubで新しいリポジトリを作成した後、以下を実行
git remote add origin https://github.com/ユーザー名/リポジトリ名.git
git branch -M main
git push -u origin main
```

> `.env.local` は `.gitignore` により自動的に除外されます。APIキーは絶対にコミットしないでください。

---

## Vercelへのデプロイ方法

1. [https://vercel.com](https://vercel.com) にログイン
2. **New Project** → GitHubリポジトリを連携
3. **Environment Variables** に以下を追加：

| 変数名 | 値 |
|--------|-----|
| `ESTAT_APP_ID` | e-StatのAPIキー |

4. **Deploy** をクリック

> `ESTAT_APP_ID` はサーバーサイド専用の変数です。`NEXT_PUBLIC_` プレフィックスは不要です。

---

## 注意事項

- `.env.local` はGitHubに含まれません（`.gitignore` で除外済み）
- APIキーはサーバー側（`process.env.ESTAT_APP_ID`）でのみ参照されます
- ブラウザに露出することはありません
