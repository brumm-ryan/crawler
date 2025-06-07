/**
 * Implementation of the BrowserSession interface
 * @typedef {import('../interfaces/BrowserSession').BrowserSession} BrowserSession
 */

/**
 * Creates a new BrowserSession instance
 * @param {Object} options - The options for the browser session
 * @param {string} options.id - The unique identifier for the browser session
 * @param {import('playwright').Browser} options.browser - The Playwright browser instance
 * @param {string} options.cdpUrl - The Chrome DevTools Protocol URL
 * @param {number} options.debugPort - The remote debugging port
 * @param {number} [options.createdAt] - The timestamp when the session was created
 * @returns {BrowserSession} A new BrowserSession instance
 */
export function createBrowserSession({ id, browser, cdpUrl, debugPort, createdAt }) {
  return {
    id,
    browser,
    cdpUrl,
    debugPort,
    createdAt: createdAt || Date.now()
  };
}