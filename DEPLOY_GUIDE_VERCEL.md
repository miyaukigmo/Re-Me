# Vercel へのデプロイ・ガイド 🚀

「Re:Me」を Vercel にデプロイして、どこでも使えるようにするための手順です。

## 1. 事前準備 (GitHub へのプッシュ)

まずは、現在のコードを GitHub にプッシュしてください。

1.  GitHub で新しいリポジトリを作成します。
2.  ローカルのターミナルで以下を実行します：
```powershell
git add .
git commit -m "Branding: Add Re:Me logo and startup screen"
git remote add origin [リポジトリURL]
git push -u origin main
```

## 2. Vercel へのデプロイ設定

1.  **Vercel Dashboard** にログインし、「Add New」 > 「Project」を選択します。
2.  GitHub リポジトリをインポートします。
3.  **Environment Variables (環境変数)** の設定が最も重要です。ローカルの `.env.local` にある内容をすべて Vercel の設定画面に入力してください：

| Key | Value (例) |
| :--- | :--- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google Cloud Console のサービスアカウントメール |
| `GOOGLE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----...` (引用符なしで貼り付け) |
| `GOOGLE_PROJECT_ID` | Google Cloud のプロジェクトID (例: `anki-484421`) |
| `ANKI_SPREADSHEET_ID` | スプレッドシートのURLから抽出したID |
| `BOOK_SPREADSHEET_NAME` | スプレッドシート内の読書メモ用シート名 (例: `my_reading_memo`) |
| `NEXT_PUBLIC_APP_URL` | デプロイ後のURL (例: `https://re-me.vercel.app`) |

> [!IMPORTANT]
> `GOOGLE_PRIVATE_KEY` を貼り付ける際は、改行などが正しく認識されるよう、コピー元（.env.local）の文字列をそのまま貼り付けてください。

## 3. デプロイの実行

1.  「Deploy」ボタンを押します。
2.  数分待つと、全世界からアクセス可能な URL が発行されます！🌸

## 4. PWA (スマホアプリ化) の設定

1.  スマホのブラウザ（Safari や Chrome）でデプロイした URL を開きます。
2.  「ホーム画面に追加」を選択すると、スマホのホーム画面に「Re:Me」のアイコンが表示され、アプリのように使えるようになります。

---
デプロイ中にエラーが出たり、環境変数の設定で迷ったりしたら、いつでも「あたし」に聞いてね！✨🌸
