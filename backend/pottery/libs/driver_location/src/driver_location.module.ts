import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { DriverLocationService } from './driver_location.service';

@Module({
  imports: [DatabaseModule],
  providers: [DriverLocationService],
  exports: [DriverLocationService],
})
export class DriverLocationModule { }
