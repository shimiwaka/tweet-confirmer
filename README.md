# tweet-confirmer

When you logged in specified X account and were going to send tweet, this Chrome extension shows alert.
It protects you from SNS accident like tweeting on a public account when you meant it was a private account.

## Function

1. When you logged in specified account :
   - when mouseover Tweet Button, popup says `このアカウントで大丈夫？`.
   - and this extension prohibits posting by Ctrl+Enter/Cmd+Enter

2. word dupplication observation
   - when tweet content included specified word more than 2 times, tweet input area will turn red.

## How To Use

### 1. import as chrome extension
1. open Google Chrome
2. enter  `chrome://extensions/` to URL bar
3. toggle on `開発者モード` at upper right
4. click `パッケージ化されていない拡張機能を読み込む`
5. select `tweet-confirmer` downloaded at step 1


### 2. Settings

1. Click app icon at Chrome toolbar and select `オプション`
2. Click `アカウントを追加` and specified account screen name and word you want to observation.
   - account name determined by partial match
   - you can specify multi accounts
3. Click `保存`, settings will be saved after that.

