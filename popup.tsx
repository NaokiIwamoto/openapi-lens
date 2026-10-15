import { useEffect, useState } from "react"

function IndexPopup() {
  const [hasOpenApiData, setHasOpenApiData] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // バックグラウンドスクリプトからOpenAPIデータの有無を確認
    chrome.runtime.sendMessage({ type: 'GET_OPENAPI_DATA' }, (response) => {
      const hasData = !!response?.data;
      setHasOpenApiData(hasData);
      setIsLoading(false);
      
      // OpenAPIデータがある場合は自動的にビューワーを開く
      if (hasData) {
        chrome.runtime.sendMessage({ type: 'OPEN_VIEWER' });
        // ポップアップを閉じる
        window.close();
      }
    });
  }, []);

  if (isLoading) {
    return (
      <div style={styles.container}>
        <p style={styles.message}>読み込み中...</p>
      </div>
    );
  }

  // OpenAPIデータがない場合のみポップアップを表示
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Swagger Viewer</h1>
      
      <div style={styles.content}>
        <p style={styles.message}>
          このページではOpenAPI/Swagger YMLデータが検出されませんでした。
        </p>
      </div>
      
      <div style={styles.footer}>
        <p style={styles.footerText}>
          preタグまたはtextareaタグ内のOpenAPI YMLを検出します
        </p>
      </div>
    </div>
  );
}

// スタイル
const styles = {
  container: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '200px',
    width: '300px',
  },
  title: {
    fontSize: '18px',
    margin: '0 0 16px 0',
    color: '#333',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center' as const,
    marginBottom: '16px',
    color: '#555',
  },
  footer: {
    marginTop: '16px',
    borderTop: '1px solid #eee',
    paddingTop: '8px',
  },
  footerText: {
    fontSize: '12px',
    color: '#888',
    margin: 0,
  },
};

export default IndexPopup
