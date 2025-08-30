import { Module } from '@nestjs/common';
import { ScansController } from './scans.controller';
import { ScansService } from './scans.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TemporalModule } from '../temporal/temporal.module';

@Module({
  imports: [PrismaModule, TemporalModule],
  controllers: [ScansController],
  providers: [ScansService],
  exports: [ScansService],
})
export class ScansModule {}