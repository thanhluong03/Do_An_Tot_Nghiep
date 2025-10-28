import { Module } from '@nestjs/common';
import { TrackingGateway } from './tracking.gateway';
import { TrackingController } from './tracking.controller';
import { DriverLocationModule } from '@app/driver_location';
import { DatabaseModule } from '@app/database';
import { GeocodingModule } from '@app/geocoding';

@Module({
  imports: [DriverLocationModule, DatabaseModule, GeocodingModule],
  controllers: [TrackingController],
  providers: [TrackingGateway],
  exports: [TrackingGateway],
})
export class TrackingModule {}