const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const path = require('path');

/**
 * Internationalization service for multi-language support
 */

// Initialize i18next
i18next
  .use(Backend)
  .init({
    lng: 'en', // default language
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    backend: {
      loadPath: path.join(__dirname, '../../locales/{{lng}}/{{ns}}.json')
    },
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    // Supported languages
    supportedLngs: ['en', 'fr', 'sw', 'ha', 'ar'],
    
    // Namespaces
    ns: ['common', 'errors', 'messages'],
    defaultNS: 'common'
  });

/**
 * Get translation for a key
 * @param {string} key - Translation key
 * @param {Object} options - Translation options
 * @param {string} language - Language code
 * @returns {string} Translated text
 */
const translate = (key, options = {}, language = 'en') => {
  return i18next.getFixedT(language)(key, options);
};

/**
 * Get error message
 * @param {string} errorKey - Error key
 * @param {Object} options - Translation options
 * @param {string} language - Language code
 * @returns {string} Translated error message
 */
const getErrorMessage = (errorKey, options = {}, language = 'en') => {
  return translate(`errors.${errorKey}`, options, language);
};

/**
 * Get success message
 * @param {string} messageKey - Message key
 * @param {Object} options - Translation options
 * @param {string} language - Language code
 * @returns {string} Translated success message
 */
const getSuccessMessage = (messageKey, options = {}, language = 'en') => {
  return translate(`messages.${messageKey}`, options, language);
};

/**
 * Extract language from request headers
 * @param {Object} req - Express request object
 * @returns {string} Language code
 */
const getLanguageFromRequest = (req) => {
  const acceptLanguage = req.get('Accept-Language');
  if (acceptLanguage) {
    // Parse Accept-Language header and return first supported language
    const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
    const supportedLngs = ['en', 'fr', 'sw', 'ha', 'ar'];
    
    for (const lang of languages) {
      if (supportedLngs.includes(lang)) {
        return lang;
      }
    }
  }
  return 'en'; // default to English
};

/**
 * Middleware to set language for request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const setLanguage = (req, res, next) => {
  req.language = getLanguageFromRequest(req);
  next();
};

module.exports = {
  translate,
  getErrorMessage,
  getSuccessMessage,
  getLanguageFromRequest,
  setLanguage,
  i18next
};