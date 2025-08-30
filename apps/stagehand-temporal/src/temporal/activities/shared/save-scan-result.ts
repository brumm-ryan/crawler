import { Context } from '@temporalio/activity';
import { SiteResults } from '../../types';

export interface SaveScanResultParams {
  scanId: number;
  url: string;
  piiSourceId: number;
  result?: SiteResults;
  error?: string;
  metadata?: {
    responseTime?: number;
    userAgent?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

const API_BASE_URL = `http://${process.env.CRAWLER_API_URL}` || 'http://localhost:8000';

export async function saveScanResult(params: SaveScanResultParams): Promise<void> {
  const logger = Context.current().log;
  
  try {
    const status = params.error ? 'error' : params.result ? 'success' : 'unknown';
    
    const payload = {
      scanId: params.scanId,
      url: params.url,
      piiSourceId: params.piiSourceId,
      status: status,
      data: params.result ? {
        listings: params.result.listings,
        url: params.result.url,
      } : null,
      error: params.error,
      metadata: {
        timestamp: new Date().toISOString(),
        ...params.metadata,
      },
    };

    logger.info(`Saving scan result for scanId: ${params.scanId}, piiSourceId: ${params.piiSourceId}, status: ${status}`);

    const response = await fetch(`${API_BASE_URL}/scan-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const savedResult = await response.json();
    logger.info(`Success fully saved scan result with ID: ${savedResult.id} for scanId: ${params.scanId}, piiSourceId: ${params.piiSourceId}`);

  } catch (error) {
    logger.error(`Failed to save scan result for scanId: ${params.scanId}, piiSourceId: ${params.piiSourceId} error: ${error}`);
    throw error;
  }
}