# Architecture

Chrome拡張（Manifest V3）。Twitter/X でのツイート誤送信を防ぐ。

## ファイル構成

```
manifest.json   - 拡張の宣言（permissions, content_scripts, action, options_page）
content.js      - メインロジック。twitter.com / x.com に注入される
popup.html/js   - ツールバーアイコンクリック時のポップアップ UI
options.html/js - 拡張の設定ページ（options_page）
```

## データフロー

```
[ユーザー操作]
  popup.js / options.js
    └─ chrome.storage.sync.set({ targetAccounts, watchWords })

[content.js 起動時]
  chrome.storage.sync.get(['targetAccounts', 'watchWords'])
    ├─ targetAccounts → アカウント名照合 → ツールチップ & ショートカット無効化
    └─ watchWords     → テキストエリア監視 → 背景色変更

chrome.storage.onChanged → watchWords 変更をリアルタイム反映
```

## content.js の主要関数

| 関数 | 役割 |
|------|------|
| `initialize()` | エントリーポイント。ページロード・URL変更時に呼ばれる |
| `setupAccountMonitoring()` | targetAccounts と現在アカウントを照合し、該当時に後続セットアップを呼ぶ |
| `setupTweetButtonTooltip()` | 投稿ボタンにホバーすると「このアカウントで大丈夫？」ツールチップを表示 |
| `setupKeyboardShortcut()` | Cmd/Ctrl+Enter の送信をブロックし alert を表示 |
| `setupWatchWordMonitoring()` | ツイートテキストエリアを MutationObserver で監視。watchWord が 2 回以上出現したら背景を `#ffbbbb` に変更 |
| `waitForElement(selector, cb)` | アカウントボタン要素が DOM に出現するまで最大 50 回ポーリング |
| `getAccountName()` | ヘッダーのアカウントボタンのテキストを取得 |

## storage スキーマ

```
chrome.storage.sync
  targetAccounts: string[]   // 監視対象アカウント名（部分一致）
  watchWords:     string[]   // 監視ワード（2回以上出現でテキストエリアを赤くする）
  alertWords:     string[]   // 警告ワード（1回でも出現したら投稿前に confirm ダイアログ）
```

## UI の二重管理に注意

`popup.js` と `options.js` は同じ設定画面をほぼ同じロジックで実装している。
`popup.js` は `watchWords` も扱うが、`options.js` は `targetAccounts` のみ。
機能追加時はどちらも更新が必要。

## DOM セレクターの脆弱性

`content.js` は Twitter/X の内部 CSS クラス（`r-xxxxx` 形式）に依存したハードコードセレクターを使用している。
Twitter の UI 変更でセレクターが壊れやすい。壊れた場合は対象要素を DevTools で再取得してセレクターを更新する。

## SPA 対応

Twitter は SPA なのでページ遷移時に `load` イベントが発火しない。
URL 変化を MutationObserver で検知して `initialize()` を再呼び出しすることで対応している。
