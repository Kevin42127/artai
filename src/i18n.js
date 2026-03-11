// 語言偵測和國際化工具

// 支援的語言列表
export const SUPPORTED_LANGUAGES = {
  'en': {
    name: 'English',
    code: 'en',
    flag: '🇺🇸'
  }
};

// 翻譯文本
export const TRANSLATIONS = {
  'en': {
    title: 'ArtAI',
    subtitle: 'Transform your imagination into beautiful images',
    placeholder: 'Describe the image you want to generate...',
    generateButton: 'Generate Image',
    generating: 'Generating...',
    generatedImages: 'Generated Images',
    clearAll: 'Clear All',
    download: 'Download',
    delete: 'Delete',
    emptyState: 'Start creating your first AI image!\nGenerated images will be saved locally',
    error: {
      emptyPrompt: 'Please enter an image description',
      generateFailed: 'Failed to generate image, please try again later'
    },
    footer: '© 2026 ArtAI'
  }
};

// 自動偵測瀏覽器語言
export function detectBrowserLanguage() {
  // 直接返回英文，無需偵測
  return 'en';
}

// 獲取翻譯文本
export function getTranslation(key, language = 'en') {
  const lang = language || detectBrowserLanguage();
  const translations = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  
  // 支援巢狀鍵值 (例如: error.emptyPrompt)
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    value = value[k];
    if (value === undefined) {
      // 回退到預設語言
      const fallbackTranslations = TRANSLATIONS['en'];
      value = fallbackTranslations;
      for (const fallbackKey of keys) {
        value = value[fallbackKey];
        if (value === undefined) return key; // 最後回退到鍵值本身
      }
      break;
    }
  }
  
  return value;
}

// 設定語言
export function setLanguage(language) {
  if (SUPPORTED_LANGUAGES[language]) {
    localStorage.setItem('preferredLanguage', language);
    return true;
  }
  return false;
}

// 獲取當前語言
export function getCurrentLanguage() {
  return localStorage.getItem('preferredLanguage') || detectBrowserLanguage();
}
