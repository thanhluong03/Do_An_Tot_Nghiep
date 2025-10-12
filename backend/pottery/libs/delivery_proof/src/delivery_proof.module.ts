import { Module } from '@nestjs/common';
import { DeliveryProofService } from './delivery_proof.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [DeliveryProofService],
  exports: [DeliveryProofService],
})
export class DeliveryProofModule { }
