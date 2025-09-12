import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { RoleService } from '@app/role';
import {
    CreateRoleDto,
    UpdateRoleDto,
    ListRoleRequestDto,
    RoleResponseDto,
} from './role.dto';
import { plainToInstance } from 'class-transformer';

@Controller('roles')
export class RoleController {
    constructor(private readonly roleService: RoleService) { }

    @Post('createrole')
    async createMany(
        @Body() createRoleDtos: CreateRoleDto[],
    ): Promise<RoleResponseDto[]> {
        const results = await Promise.all(
            createRoleDtos.map(dto => this.roleService.create(dto))
        );
        return results.map(result =>
            plainToInstance(RoleResponseDto, result.role, {
                excludeExtraneousValues: true,
            })
        );
    }

    @Get('listrole')
    async findAll(@Query() query: ListRoleRequestDto): Promise<RoleResponseDto[]> {
        const result = await this.roleService.findAll(query);
        return result.roles.map(role =>
            plainToInstance(RoleResponseDto, role, {
                excludeExtraneousValues: true,
            }),
        );
    }

    @Get('roledetail/:id')
    async findOne(@Param('id') id: number): Promise<RoleResponseDto[]> {
        const result = await this.roleService.findOne(Number(id));
        return [
            plainToInstance(RoleResponseDto, result.role, {
                excludeExtraneousValues: true,
            })
        ];
    }

    @Put('updaterole/:id')
    async updateOne(
        @Param('id') id: number,
        @Body() updateRoleDto: UpdateRoleDto,
    ): Promise<RoleResponseDto[]> {
        const result = await this.roleService.update(Number(id), updateRoleDto);
        return [
            plainToInstance(RoleResponseDto, result.role, {
                excludeExtraneousValues: true,
            })
        ];
    }

    @Delete('deleterole/:id')
    async removeOne(@Param('id') id: number): Promise<{ message: string }[]> {
        const result = await this.roleService.softDelete(Number(id));
        return [result];
    }
}