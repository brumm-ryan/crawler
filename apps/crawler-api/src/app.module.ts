import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DatasheetModule } from './datasheets/datasheet.module';
import { TemporalModule } from './temporal/temporal.module';
import { TemporalActivitiesModule } from './temporal/temporal-activities.module';
import { AuthModule } from './auth/auth.module';
import { ScansModule } from './scans/scans.module';
import { ScanResultsModule } from './scan-results/scan-results.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    TemporalModule, // Core Temporal client service (no dependencies)
    DatasheetModule,
    ScansModule, // Depends on TemporalModule
    ScanResultsModule,
    TemporalActivitiesModule, // Depends on ScansModule and ScanResultsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
