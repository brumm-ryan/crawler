import { Browser } from 'playwright';

/**
 * Interface representing a browser session in the pool
 */
export interface BrowserSession {
  /** UUID that the calling activity returns on DELETE */
  id: string;
  /** Playwright handle so the pool can close it */
  browser: Browser;
  /** ws://…/devtools/browser/<guid> for Stagehand */
  cdpUrl: string;
  /** The remote‑debugging‑port this Chrome listens on */
  debugPort: number;
  /** Timestamp for idle‑TTL eviction */
  createdAt: number;
}
