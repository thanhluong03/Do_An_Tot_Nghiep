import { Module } from '@nestjs/common';
import { SendMailService } from './send_mail.service';
import { DatabaseModule } from '@app/database';
import { OrderModule } from '@app/order';

@Module({
  imports: [DatabaseModule, OrderModule],
  providers: [SendMailService],
  exports: [SendMailService],
})
export class SendMailModule { }
