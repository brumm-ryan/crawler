import { Injectable, Logger } from '@nestjs/common';
import { Context } from '@temporalio/activity';
import { ScanResultsService, CreateScanResultDto } from '../../scan-results/scan-results.service';

export interface CreateScanResultParams {
  scanId: number;
  url: string;
  piiSourceId: number;
  result?: any;
  error?: string;
  metadata?: any;
}

@Injectable()
export class CreateScanResultActivity {
  private readonly logger = new Logger(CreateScanResultActivity.name);

  constructor(private readonly scanResultsService: ScanResultsService) {}

  async execute(params: CreateScanResultParams): Promise<void> {
    const activityLogger = Context.current().log;
    
    try {
      const status = params.error ? 'error' : params.result ? 'success' : 'unknown';
      
      const createDto: CreateScanResultDto = {
        scanId: params.scanId,
        url: params.url,
        piiSourceId: params.piiSourceId,
        status: status,
        data: params.result,
        error: params.error,
        metadata: params.metadata || {},
      };

      activityLogger.info(`Creating scan result for scanId: ${params.scanId}, piiSourceId: ${params.piiSourceId}, status: ${status}`);

      const result = await this.scanResultsService.create(createDto);
      
      activityLogger.info(`Successfully created scan result with ID: ${result.id} for scanId: ${params.scanId}, piiSourceId: ${params.piiSourceId}`);

    } catch (error) {
      activityLogger.error(`Failed to create scan result for scanId: ${params.scanId}, piiSourceId: ${params.piiSourceId}:`, error);
      throw error;
    }
  }
}