import React from 'react';
import { detectOpenApiYml } from '~lib/detect-openapi';

// 最後のスキャン結果を保存
let lastScanResult = false;

// ページ内のpreタグとtextareaタグを検索
function scanForOpenApiYml() {
  
  const elements = [
    ...Array.from(document.querySelectorAll('pre')),
    ...Array.from(document.querySelectorAll('textarea'))
  ];
  
  let foundOpenApiYml = false;
  
  for (const element of elements) {
    const text = element.textContent || '';
    if (text.trim() && detectOpenApiYml(text)) {
      // OpenAPI YMLデータを検出
      chrome.runtime.sendMessage(
        { type: 'OPENAPI_DATA', data: text },
      );
      foundOpenApiYml = true;
      // 最初に見つかったものだけを処理
      break;
    }
  }
  
  // OpenAPI YMLが見つからなかった場合、バックグラウンドスクリプトに通知
  if (!foundOpenApiYml && lastScanResult !== foundOpenApiYml) {
    chrome.runtime.sendMessage(
      { type: 'NO_OPENAPI_DATA' }
    );
  }
  
  // スキャン結果を保存
  lastScanResult = foundOpenApiYml;
  
  return foundOpenApiYml;
}

// DOMの変更を監視して新しいOpenAPI YMLデータを検出
const observer = new MutationObserver((mutations) => {
  // 変更があった場合、少し待ってからスキャン
  setTimeout(scanForOpenApiYml, 500);
});

// 監視を開始
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// 初回スキャン
scanForOpenApiYml();

// ダミーのReactコンポーネントを追加（エラー回避のため）
const App = () => <div></div>;
export default App;
