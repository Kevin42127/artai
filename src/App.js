import React, { useState, useCallback, useEffect } from 'react';
import { detectBrowserLanguage, getTranslation, setLanguage, SUPPORTED_LANGUAGES } from './i18n';
import { ImageSkeleton, InputSkeleton, HeaderSkeleton } from './Skeleton';

/* global puter */

function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(detectBrowserLanguage());
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [shouldShowLanguageSwitcher, setShouldShowLanguageSwitcher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 從本地儲存載入圖像
  useEffect(() => {
    const savedImages = localStorage.getItem('aiGeneratedImages');
    
    // 模擬載入延遲以顯示骨架屏
    setTimeout(() => {
      if (savedImages) {
        try {
          setGeneratedImages(JSON.parse(savedImages));
        } catch (err) {
          console.error('載入本地圖像失敗:', err);
        }
      }
      setIsLoading(false);
    }, 800);
  }, []);

  // 點擊外部關閉語言選擇器
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageSelector && !event.target.closest('.language-selector')) {
        setShowLanguageSelector(false);
      }
    };

    // 禁止右鍵選單
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [showLanguageSelector]);

  // 初始化時設定 HTML lang 屬性
  useEffect(() => {
    const htmlRoot = document.getElementById('html-root');
    if (htmlRoot) {
      htmlRoot.setAttribute('lang', currentLanguage);
    }
    
    // 檢查用戶是否手動切換過語言
    const hasManuallySwitched = localStorage.getItem('hasManuallySwitchedLanguage');
    if (hasManuallySwitched === 'true') {
      setShouldShowLanguageSwitcher(true);
    }
  }, [currentLanguage]);

  // 保存圖像到本地儲存
  const saveToLocalStorage = useCallback((images) => {
    try {
      localStorage.setItem('aiGeneratedImages', JSON.stringify(images));
    } catch (err) {
      console.error('保存圖像到本地失敗:', err);
    }
  }, []);

  const generateImage = useCallback(async () => {
    if (!prompt.trim()) {
      setError(getTranslation('error.emptyPrompt', currentLanguage));
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // 使用內建的 AI 圖像生成服務
      const image = await puter.ai.txt2img(prompt, {
        model: 'gpt-image-1.5',
        quality: 'standard',
        testMode: false
      });

      // 創建圖片對象
      const imageData = {
        id: Date.now(),
        url: image.src,
        prompt: prompt,
        timestamp: new Date().toLocaleString('zh-TW'),
        apiType: 'built-in'
      };

      const newImages = [imageData, ...generatedImages];
      setGeneratedImages(newImages);
      saveToLocalStorage(newImages);
      setPrompt('');
    } catch (err) {
      console.error('生成圖像時發生錯誤:', err);
      setError(getTranslation('error.generateFailed', currentLanguage));
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, generatedImages, saveToLocalStorage, currentLanguage]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
      e.preventDefault();
      generateImage();
    }
  };

  const downloadImage = (imageData) => {
    const link = document.createElement('a');
    link.href = imageData.url;
    link.download = `ai-image-${imageData.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteImage = (imageId) => {
    const newImages = generatedImages.filter(img => img.id !== imageId);
    setGeneratedImages(newImages);
    saveToLocalStorage(newImages);
  };

  const clearAllImages = () => {
    setGeneratedImages([]);
    saveToLocalStorage([]);
  };

  const handleLanguageChange = (language) => {
    if (setLanguage(language)) {
      // 記錄用戶手動切換過語言
      localStorage.setItem('hasManuallySwitchedLanguage', 'true');
      setShouldShowLanguageSwitcher(true);
      
      // 添加淡出動畫
      const dropdown = document.querySelector('.language-selector-dropdown');
      if (dropdown) {
        dropdown.classList.add('fade-out');
      }
      
      // 延遲切換語言以顯示動畫
      setTimeout(() => {
        setIsChangingLanguage(true);
        setCurrentLanguage(language);
        setShowLanguageSelector(false);
        
        // 更新 HTML lang 屬性
        const htmlRoot = document.getElementById('html-root');
        if (htmlRoot) {
          htmlRoot.setAttribute('lang', language);
        }
        
        // 移除動畫類並添加淡入效果
        setTimeout(() => {
          setIsChangingLanguage(false);
        }, 300);
      }, 200);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 標題 */}
        <header className="text-center mb-6 sm:mb-8 lg:mb-12 relative">
          {/* 語言選擇器 - 僅在用戶手動切換過語言時顯示 */}
          {shouldShowLanguageSwitcher && !isLoading && (
            <div className="absolute top-0 right-0 z-10">
              <div className="relative language-selector">
                <button
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  className="language-button p-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
                  title="選擇語言"
                >
                  <span className="text-lg mr-1">{SUPPORTED_LANGUAGES[currentLanguage]?.flag || '🌐'}</span>
                  <span className="font-semibold hidden sm:inline">{currentLanguage.toUpperCase()}</span>
                  <span className="font-semibold sm:hidden">語言</span>
                </button>
                
                {showLanguageSelector && (
                  <div className="language-selector-dropdown absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded shadow-2xl z-50 overflow-hidden">
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                      <button
                        key={code}
                        onClick={() => handleLanguageChange(code)}
                        className={`language-selector-item w-full text-left px-4 py-3 text-sm hover:bg-gray-700 flex items-center space-x-3 transition-all duration-200 ${
                          currentLanguage === code ? 'bg-gray-700 text-white border-l-4 border-blue-500' : 'text-gray-200 hover:text-white'
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-medium flex-1 text-left">{lang.name}</span>
                        {currentLanguage === code && <span className="text-blue-400 font-bold ml-auto">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* 標題 - 完全居中 */}
          {isLoading ? (
            <HeaderSkeleton />
          ) : (
            <div className={`language-transition ${isChangingLanguage ? 'fade-in' : ''}`}>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white no-select">
                {getTranslation('title', currentLanguage)}
              </h1>
              
              <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto px-4 mt-4 no-select">
                {getTranslation('subtitle', currentLanguage)}
              </p>
            </div>
          )}
        </header>

        {/* 主要輸入區域 */}
        <main className="max-w-4xl mx-auto">
          {isLoading ? (
            <InputSkeleton />
          ) : (
            <div className="bg-gray-800 p-4 sm:p-6 lg:p-8 border border-gray-700">
              {/* 輸入框 */}
              <div className="mb-4 sm:mb-6">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={getTranslation('placeholder', currentLanguage)}
                  className="input-field w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-700 text-white border-gray-600 border rounded resize-none text-select"
                  rows={4}
                  disabled={isGenerating}
                />
              </div>

              {/* 錯誤訊息 */}
              {error && (
                <div className="mb-4 p-3 sm:p-4 bg-red-900 border border-red-700 text-red-200 text-sm sm:text-base text-select">
                  {error}
                </div>
              )}

              {/* 生成按鈕 */}
              <button
                onClick={generateImage}
                disabled={isGenerating || !prompt.trim()}
                className="generate-btn w-full py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base font-semibold text-white"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                    <div className="loading-spinner"></div>
                    <span>{getTranslation('generating', currentLanguage)}</span>
                  </div>
                ) : (
                  getTranslation('generateButton', currentLanguage)
                )}
              </button>
            </div>
          )}

          {/* 生成的圖像展示區 */}
          {!isLoading && generatedImages.length > 0 && (
            <div className="mt-8 sm:mt-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{getTranslation('generatedImages', currentLanguage)}</h2>
                <button
                  onClick={clearAllImages}
                  className="py-2 px-3 sm:px-4 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  {getTranslation('clearAll', currentLanguage)}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {generatedImages.map((imageData) => (
                  <div
                    key={imageData.id}
                    className="image-container bg-white border"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={imageData.url}
                        alt={imageData.prompt}
                        className="w-full h-full object-cover no-context-menu"
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="flex gap-2 sm:gap-3">
                        <button
                          onClick={() => downloadImage(imageData)}
                          className="flex-1 py-1.5 sm:py-2 px-2 sm:px-3 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm font-medium transition-colors"
                        >
                          {getTranslation('download', currentLanguage)}
                        </button>
                        <button
                          onClick={() => deleteImage(imageData.id)}
                          className="flex-1 py-1.5 sm:py-2 px-2 sm:px-3 bg-gray-500 hover:bg-gray-600 text-white text-xs sm:text-sm font-medium transition-colors"
                        >
                          {getTranslation('delete', currentLanguage)}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 生成中顯示骨架屏 */}
          {isGenerating && (
            <div className="mt-8 sm:mt-12">
              <div className="mb-4 sm:mb-6">
                <div className="h-6 sm:h-7 lg:h-8 bg-gray-700 rounded w-1/3 animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                <ImageSkeleton />
                <ImageSkeleton />
                <ImageSkeleton />
              </div>
            </div>
          )}

          {/* 空狀態 */}
          {!isLoading && generatedImages.length === 0 && !isGenerating && (
            <div className="mt-6 sm:mt-8 lg:mt-12 text-center">
              <div className="bg-gray-800 border border-gray-700 p-4 sm:p-6 lg:p-8 xl:p-12">
                <div className="text-gray-400 text-sm sm:text-base lg:text-lg whitespace-pre-line px-2">
                  {getTranslation('emptyState', currentLanguage)}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 頁腳 */}
        <footer className="mt-8 sm:mt-12 lg:mt-16 text-center text-gray-400 text-xs sm:text-sm px-4">
          {!isLoading && <p>{getTranslation('footer', currentLanguage)}</p>}
        </footer>
      </div>
    </div>
  );
}

export default App;
