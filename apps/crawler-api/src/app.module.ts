import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DatasheetModule } from './datasheets/datasheet.module';
import { TemporalModule } from './temporal/temporal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    TemporalModule,
    DatasheetModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
