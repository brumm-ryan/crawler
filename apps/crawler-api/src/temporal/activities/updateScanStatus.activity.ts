import { Injectable, Logger } from '@nestjs/common';
import { Context } from '@temporalio/activity';
import { ScansService } from '../../scans/scans.service';

export interface UpdateScanStatusParams {
  scanId: number;
  status: string;
}

@Injectable()
export class UpdateScanStatusActivity {
  private readonly logger = new Logger(UpdateScanStatusActivity.name);

  constructor(private readonly scansService: ScansService) {}

  async execute(params: UpdateScanStatusParams): Promise<void> {
    const activityLogger = Context.current().log;
    
    try {
      activityLogger.info(`Updating scan ${params.scanId} status to: ${params.status}`);

      await this.scansService.updateStatus(params.scanId, params.status);
      
      activityLogger.info(`Successfully updated scan ${params.scanId} status to: ${params.status}`);

    } catch (error) {
      activityLogger.error(`Failed to update scan ${params.scanId} status to ${params.status}:`, error);
      throw error;
    }
  }
}