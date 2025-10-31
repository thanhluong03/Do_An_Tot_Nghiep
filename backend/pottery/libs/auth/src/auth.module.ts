import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseModule } from '@app/database';
import { SendMailModule } from '@app/send_mail';

@Module({
  imports: [DatabaseModule, SendMailModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule { }
