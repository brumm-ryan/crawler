import express from 'express';
import browserPoolService from '../services/browserPoolService.js';

const router = express.Router();

/**
 * @api {post} /browsers Create/checkout a browser instance
 * @apiName CreateBrowser
 * @apiGroup Browsers
 * @apiSuccess {String} id Unique identifier for the browser instance
 * @apiSuccess {String} cdpUrl Chrome DevTools Protocol URL for connecting to the browser
 * @apiError {Object} error Error message
 */
router.post('/', async (req, res) => {
  try {
    const browser = await browserPoolService.checkoutBrowser();
    res.status(201).json(browser);
  } catch (error) {
    console.error('Error creating browser:', error);
    res.status(500).json({ error: 'Failed to create browser instance' });
  }
});

/**
 * @api {get} /browsers/status Get browser pool status
 * @apiName GetBrowserStatus
 * @apiGroup Browsers
 * @apiSuccess {Object} status Status information about the browser pool
 * @apiError {Object} error Error message
 */
router.get('/status', (req, res) => {
  try {
    const status = browserPoolService.getStatus();
    res.json({ status });
  } catch (error) {
    console.error('Error getting browser pool status:', error);
    res.status(500).json({ error: 'Failed to get browser pool status' });
  }
});

/**
 * @api {delete} /browsers/:id Release a browser instance
 * @apiName ReleaseBrowser
 * @apiGroup Browsers
 * @apiParam {String} id Browser instance ID
 * @apiSuccess {Boolean} success Whether the browser was successfully released
 * @apiError {Object} error Error message
 */
router.delete('/:id/release', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await browserPoolService.releaseBrowser(id);

    if (success) {
      res.json({ success: true, message: `Browser ${id} released successfully` });
    } else {
      res.status(404).json({ success: false, error: `Browser ${id} not found` });
    }
  } catch (error) {
    console.error(`Error releasing browser ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to release browser instance' });
  }
});

/**
 * @api {delete} /browsers/:id Destroy a browser instance
 * @apiName DestroyBrowser
 * @apiGroup Browsers
 * @apiParam {String} id Browser instance ID
 * @apiSuccess {Boolean} success Whether the browser was successfully destroyed
 * @apiError {Object} error Error message
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await browserPoolService.destroyBrowser(id);

    if (success) {
      res.json({ success: true, message: `Browser ${id} destroyed successfully` });
    } else {
      res.status(404).json({ success: false, error: `Browser ${id} not found` });
    }
  } catch (error) {
    console.error(`Error destroying browser ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to destroy browser instance' });
  }
});

export default router;
