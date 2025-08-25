import { Module } from '@nestjs/common';
import { DatasheetController } from './datasheet.controller';
import { DatasheetService } from './datasheet.service';

@Module({
  controllers: [DatasheetController],
  providers: [DatasheetService],
  exports: [DatasheetService],
})
export class DatasheetModule {}