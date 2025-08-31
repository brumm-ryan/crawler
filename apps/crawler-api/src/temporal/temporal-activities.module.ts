import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TemporalWorkerService } from './temporal-worker.service';
import { CreateScanResultActivity } from './activities/createScanResult.activity';
import { UpdateScanStatusActivity } from './activities/updateScanStatus.activity';
import { ScansModule } from '../scans/scans.module';
import { ScanResultsModule } from '../scan-results/scan-results.module';

@Module({
  imports: [ConfigModule, ScansModule, ScanResultsModule],
  providers: [
    TemporalWorkerService,
    CreateScanResultActivity,
    UpdateScanStatusActivity,
  ],
  exports: [
    CreateScanResultActivity,
    UpdateScanStatusActivity,
  ],
})
export class TemporalActivitiesModule {}