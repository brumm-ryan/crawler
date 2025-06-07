import { chromium } from 'playwright';
import genericPool from 'generic-pool';
import fetch from 'node-fetch';
import getPort from 'get-port';
import { createBrowserSession } from '../models/BrowserSession.js';

class BrowserPoolService {
  constructor(options = {}) {
    this.options = {
      max: 10,
      min: 2,
      // have generic-pool run its idle evictor
      evictionRunIntervalMillis: 30_000,
      idleTimeoutMillis: 10 * 60_000,
      testOnBorrow: true,
      ...options,
    };

    this.activeBrowsers = new Map();

        this.pool = genericPool.createPool({
          create: async () => {
            const debugPort = await getPort();
            const browser = await chromium.launch({
              args: [`--remote-debugging-port=${debugPort}`],
              headless:false,
            });

            // fetch the CDP endpoint
            const {webSocketDebuggerUrl: cdpUrl} = await fetch(
                `http://127.0.0.1:${debugPort}/json/version`
            ).then(r => r.json());

            // build your session wrapper
            const session = createBrowserSession({
              id: this._generateId(),
              browser,
              cdpUrl,
              debugPort,
              createdAt: Date.now()
            });

            browser.once('disconnected', () => {
              this.activeBrowsers.delete(session.id)
              this.pool
                  .release(session)
                  .catch(err =>
                      console.error(
                          `Error releasing session ${session.id} after disconnect:`,
                          err
                      )
                  );
            });

            return session;
          },

          destroy: async (session) => {
            await session.browser.close();
          },

          validate: session => session.browser.isConnected?.() ?? true

        }, this.options);
    }


  /**
   * Checkout a browser from the pool and return its connection details
   * @returns {Promise<{id: string, cdpUrl: string}>} Browser connection details
   */
  async checkoutBrowser() {
    try {
      // Acquire a browser session from the pool
      const browserSession = await this.pool.acquire();

      // Store the browser session with its ID
      this.activeBrowsers.set(browserSession.id, browserSession);

      // Return the ID and CDP URL for the client
      return { 
        id: browserSession.id, 
        cdpUrl: browserSession.cdpUrl 
      };
    } catch (error) {
      console.error('Error checking out browser:', error);
      throw error;
    }
  }

  /**
   * Release a browser back to the pool
   * @param {string} id - The ID of the browser to release
   * @returns {Promise<boolean>} Whether the browser was successfully released
   */
  async releaseBrowser(id) {
    try {
      if (!this.activeBrowsers.has(id)) {
        return false;
      }

      const browserSession = this.activeBrowsers.get(id);
      await this.pool.release(browserSession);
      this.activeBrowsers.delete(id);

      return true;
    } catch (error) {
      console.error(`Error releasing browser ${id}:`, error);
      throw error;
    }
  }

  /**
   * Destroy a browser instance
   * @param {string} id - The ID of the browser to destroy
   * @returns {Promise<boolean>} Whether the browser was successfully destroyed
   */
  async destroyBrowser(id) {
    try {
      if (!this.activeBrowsers.has(id)) {
        return false;
      }

      const browserSession = this.activeBrowsers.get(id);
      await browserSession.browser.close();
      this.activeBrowsers.delete(id);

      return true;
    } catch (error) {
      console.error(`Error destroying browser ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get the status of the browser pool
   * @returns {Object} Pool status information
   */
  getStatus() {
    return {
      size: this.pool.size,
      available: this.pool.available,
      borrowed: this.pool.borrowed,
      pending: this.pool.pending,
      max: this.pool.max,
      min: this.pool.min,
      activeBrowsers: this.activeBrowsers.size
    };
  }

  /**
   * Generate a unique ID for a browser instance
   * @returns {string} A unique ID
   * @private
   */
  _generateId() {
    return `browser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Drain the pool and close all browsers
   * @returns {Promise<void>}
   */
  async drain() {
    await this.pool.drain();
    await this.pool.clear();
  }
}

// Create a singleton instance
const browserPoolService = new BrowserPoolService();

export default browserPoolService;
