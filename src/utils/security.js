// @/utils/security.js

/**
 * 清理輸入字串，移除潛在的 XSS 威脅
 * @param {any} input - 要清理的輸入值
 * @returns {any} - 清理後的值
 */
export const cleanInput = (input) => {
    if (typeof input !== 'string') return input;

    return input
        .trim()
        // 移除 HTML 標籤
        .replace(/[<>]/g, '')
        // 移除 javascript: 協議
        .replace(/javascript:/gi, '')
        // 移除事件處理器
        .replace(/on\w+=/gi, '')
        // 移除資料協議
        .replace(/data:/gi, '')
        // 移除 vbscript: 協議
        .replace(/vbscript:/gi, '')
        // 過濾常見的 XSS 向量
        .replace(/&#/g, '&amp;#')
        // 過濾 Unicode 字元
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
};

/**
 * 清理 HTML 內容
 * @param {string} html - 要清理的 HTML 內容
 * @returns {string} - 清理後的 HTML
 */
export const sanitizeHtml = (html) => {
    if (typeof html !== 'string') return '';

    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
};

/**
 * 驗證輸入是否包含 XSS 攻擊向量
 * @param {string} value - 要驗證的值
 * @returns {boolean} - 如果安全返回 true，不安全返回 false
 */
export const validateNoXSS = (value) => {
    if (typeof value !== 'string') return true;

    const xssPatterns = [
        /<[^>]*>/,                 // HTML 標籤
        /javascript:/i,            // javascript 協議
        /data:/i,                  // data 協議
        /on\w+=/i,                // 事件處理器
        /&#/,                      // HTML 實體
        /\\/,                      // 反斜線
        /%[0-9A-F]{2}/            // URL 編碼
    ];

    return !xssPatterns.some(pattern => pattern.test(value));
};

/**
 * URL 參數清理
 * @param {string} url - 要清理的 URL
 * @returns {string} - 清理後的 URL
 */
export const sanitizeUrl = (url) => {
    if (typeof url !== 'string') return '';

    // 移除危險協議
    const dangerousProtocols = [
        'javascript:',
        'data:',
        'vbscript:',
        'file:'
    ];

    const lowerUrl = url.toLowerCase();
    if (dangerousProtocols.some(protocol => lowerUrl.includes(protocol))) {
        return '#';
    }

    return url;
};

/**
 * 請求資料安全處理
 * @param {Object} data - 請求資料
 * @returns {Object} - 處理後的安全資料
 */
export const sanitizeRequestData = (data) => {
    if (!data || typeof data !== 'object') return data;

    return Object.entries(data).reduce((acc, [key, value]) => {
        acc[key] = cleanInput(value);
        return acc;
    }, {});
};

/**
 * 響應資料安全處理
 * @param {Object|string} data - 響應資料
 * @returns {Object|string} - 處理後的安全資料
 */
export const sanitizeResponseData = (data) => {
    if (typeof data === 'string') {
        return cleanInput(data);
    }

    if (typeof data === 'object' && data !== null) {
        return Object.entries(data).reduce((acc, [key, value]) => {
            acc[key] = typeof value === 'string' ? cleanInput(value) : value;
            return acc;
        }, {});
    }

    return data;
};