// アイコンのインポート
import { detectOpenApiYml } from '~lib/detect-openapi'
import Icon16Src from 'url:./assets/icon_16.png'
import Icon32Src from 'url:./assets/icon_32.png'
import Icon48Src from 'url:./assets/icon_48.png'
import Icon64Src from 'url:./assets/icon_64.png'
import Icon128Src from 'url:./assets/icon_128.png'
import Icon16GreySrc from 'url:./assets/icon_16_grey.png'
import Icon32GreySrc from 'url:./assets/icon_32_grey.png'
import Icon48GreySrc from 'url:./assets/icon_48_grey.png'
import Icon64GreySrc from 'url:./assets/icon_64_grey.png'
import Icon128GreySrc from 'url:./assets/icon_128_grey.png'

// バックグラウンドスクリプト
// Chrome拡張機能のバックグラウンドプロセスとして動作し、
// コンテンツスクリプトとポップアップ、ビューアーページ間の通信を管理します

// OpenAPI YMLデータをタブIDごとに保存するためのマップ
const openApiDataMap = new Map<number, string>();

// 現在のアクティブなタブID
let activeTabId: number | null = null;

// 最後に検出されたOpenAPIデータ（ビューワー用）
let lastOpenApiData: string | null = null;

// アイコンの状態を更新する関数
function updateIcon(hasOpenApiData: boolean) {
  if (hasOpenApiData) {
    // OpenAPIデータがある場合は通常のアイコンを表示
    chrome.action.setIcon({
      path: {
        "16": Icon16Src,
        "32": Icon32Src,
        "48": Icon48Src,
        "64": Icon64Src,
        "128": Icon128Src
      }
    });
  } else {
    // OpenAPIデータがない場合はグレーのアイコンを表示
    chrome.action.setIcon({
      path: {
        "16": Icon16GreySrc,
        "32": Icon32GreySrc,
        "48": Icon48GreySrc,
        "64": Icon64GreySrc,
        "128": Icon128GreySrc
      }
    });
  }
}

// 現在のタブのOpenAPIデータの有無に基づいてアイコンを更新する関数
function updateIconForActiveTab() {
  if (activeTabId !== null && openApiDataMap.has(activeTabId)) {
    updateIcon(true);
  } else {
    updateIcon(false);
  }
}

// コンテンツスクリプトからのメッセージを処理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // タブIDを取得
  const tabId = sender.tab?.id;
  if (!tabId) {
    sendResponse({ success: false, error: 'タブIDが取得できません' });
    return true;
  }

  if (message.type === 'OPENAPI_DATA') {
    // OpenAPIデータをタブIDごとに保存
    openApiDataMap.set(tabId, message.data);
    
    // 現在のアクティブなタブの場合のみアイコンを更新し、最後のデータを更新
    if (tabId === activeTabId) {
      updateIcon(true);
      lastOpenApiData = message.data;
    }
    
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'NO_OPENAPI_DATA') {
    // OpenAPIデータがない場合、タブIDに対応するデータを削除
    openApiDataMap.delete(tabId);
    
    // 現在のアクティブなタブの場合のみアイコンを更新
    if (tabId === activeTabId) {
      updateIcon(false);
    }
    
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'GET_OPENAPI_DATA') {
    // アクティブなタブのOpenAPIデータまたは最後に検出されたOpenAPIデータを返す
    let data = null;
    
    if (activeTabId !== null && openApiDataMap.has(activeTabId)) {
      // アクティブなタブにOpenAPIデータがある場合
      data = openApiDataMap.get(activeTabId) || null;
    } else if (lastOpenApiData !== null) {
      // 最後に検出されたOpenAPIデータがある場合
      data = lastOpenApiData;
    }
    
    sendResponse({ data });
    return true;
  }
  
  if (message.type === 'OPEN_VIEWER') {
    // ビューアーページを開く
    chrome.tabs.create({ url: chrome.runtime.getURL('tabs/viewer.html') });
    sendResponse({ success: true });
    return true;
  }
});

// 拡張機能のアイコンがクリックされたときの処理
chrome.action.onClicked.addListener(() => {
    let openApiData = null;
    
    // アクティブなタブにOpenAPIデータがある場合
    if (activeTabId !== null && openApiDataMap.has(activeTabId)) {
      openApiData = openApiDataMap.get(activeTabId) || null;
      lastOpenApiData = openApiData;
    } else if (lastOpenApiData !== null) {
      // 最後に検出されたOpenAPIデータを使用
      openApiData = lastOpenApiData;
    }
    
    if (openApiData) {
      // セッションストレージにOpenAPIデータを保存
      chrome.storage.session.set({ 'openApiViewerData': openApiData }, () => {
        // ビューアーページを開く
        chrome.tabs.create({ url: chrome.runtime.getURL('tabs/viewer.html') });
      });
    }
});

// タブが切り替わったときの処理
chrome.tabs.onActivated.addListener((activeInfo) => {
  // 現在のアクティブなタブIDを更新
  activeTabId = activeInfo.tabId;
  // アイコンを更新
  updateIconForActiveTab();
  
  // 最後のOpenAPIデータを更新
  if (openApiDataMap.has(activeInfo.tabId)) {
    lastOpenApiData = openApiDataMap.get(activeInfo.tabId) || null;
  } else {
    lastOpenApiData = null;
  }
});

// タブが更新されたときの処理
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 現在のアクティブなタブが更新された場合、アイコンを更新
  if (tabId === activeTabId && changeInfo.status === 'complete') {
    updateIconForActiveTab();
  }
});

// 拡張機能がインストールまたは更新されたときの処理
chrome.runtime.onInstalled.addListener(() => {
  // 初期状態ではOpenAPIデータがないのでグレーアイコンを表示
  updateIcon(false);

  // 現在のアクティブなタブIDを取得
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].id) {
      activeTabId = tabs[0].id;
    }
  });

  // コンテキストメニューを作成
  chrome.contextMenus.create({
    id: 'open-in-redoc',
    title: 'Redocで表示',
    documentUrlPatterns: [
      'https://github.com/*/*/blob/*/*.yaml',
      'https://github.com/*/*/blob/*/*.yml'
    ]
  });
});

// コンテキストメニュークリック時の処理
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'open-in-redoc') return;
  if (!tab?.url) return;

  const rawUrl = tab.url.replace('/blob/', '/raw/');

  try {
    const response = await fetch(rawUrl);
    const text = await response.text();

    if (detectOpenApiYml(text)) {
      chrome.storage.session.set({ openApiViewerData: text }, () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('tabs/viewer.html') });
      });
    }
  } catch (e) {
    // fetch失敗時は何もしない
  }
});
