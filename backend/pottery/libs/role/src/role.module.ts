import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule { }
