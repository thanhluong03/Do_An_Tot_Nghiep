import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { LoginService } from './login.service';
import { DatabaseModule } from '@app/database';
import { GoogleStrategy } from './google.strategy';
import { CustomerModule } from '@app/customer';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    DatabaseModule,
    CustomerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  providers: [LoginService, GoogleStrategy],
  exports: [LoginService, JwtModule, PassportModule],
})
export class LoginModule { }
