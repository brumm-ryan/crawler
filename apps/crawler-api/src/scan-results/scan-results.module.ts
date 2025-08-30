import { Module } from '@nestjs/common';
import { ScanResultsController } from './scan-results.controller';
import { ScanResultsService } from './scan-results.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScanResultsController],
  providers: [ScanResultsService],
  exports: [ScanResultsService],
})
export class ScanResultsModule {}