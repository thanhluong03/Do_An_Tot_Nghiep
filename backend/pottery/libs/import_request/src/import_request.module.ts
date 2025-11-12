import { Module } from '@nestjs/common';
import { ImportRequestService } from './import_request.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [ImportRequestService],
  exports: [ImportRequestService],
})
export class ImportRequestModule { }
