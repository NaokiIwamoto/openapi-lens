import React, { useEffect, useState } from 'react';
import { RedocStandalone } from 'redoc';
import * as yaml from 'js-yaml';

// ビューアーコンポーネント
function ViewerPage() {
  const [openApiData, setOpenApiData] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // セッションストレージからOpenAPIデータを取得
    chrome.storage.session.get(['openApiViewerData'], (result) => {
      if (result && result.openApiViewerData) {
        const data = result.openApiViewerData;
        setOpenApiData(data);
        
        try {
          // YAMLをJSONに変換
          const jsonObj = yaml.load(data) as any;
          setJsonData(jsonObj as object);
        } catch (e) {
          setError('OpenAPI YMLデータの解析に失敗しました。形式が正しいか確認してください。');
        }
      } else {
        // セッションストレージにデータがない場合はバックグラウンドスクリプトに問い合わせる（フォールバック）
        chrome.runtime.sendMessage({ type: 'GET_OPENAPI_DATA' }, (response) => {
          if (response && response.data) {
            setOpenApiData(response.data);

            try {
              // YAMLをJSONに変換
              const jsonObj = yaml.load(response.data) as any;
              setJsonData(jsonObj as object);
            } catch (e) {
              setError('OpenAPI YMLデータの解析に失敗しました。形式が正しいか確認してください。');
            }
          } else {
            setError('OpenAPIデータが見つかりませんでした。');
          }
          
          setIsLoading(false);
        });
      }
      
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>エラー</h2>
        <p>{error}</p>
        <pre>{openApiData || 'データなし'}</pre>
      </div>
    );
  }

  if (!jsonData) {
    return (
      <div className="error">
        <h2>エラー</h2>
        <p>データの変換に失敗しました。</p>
      </div>
    );
  }

  return (
    <RedocStandalone
      spec={jsonData as any}
      options={{
        hideHostname: true,
        nativeScrollbars: true,
        theme: {
          colors: {
            primary: {
              main: '#4CAF50'
            }
          }
        },
        hideDownloadButton: false,
        expandResponses: '200,201',
        jsonSampleExpandLevel: 3,
        hideSingleRequestSampleTab: true,
        showExtensions: true,
        sortPropsAlphabetically: true,
      }}
    />
  );
}

export default ViewerPage;
