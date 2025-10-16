import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermission = this.reflector.get<string>('permission', context.getHandler());
        if (!requiredPermission) return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const permissions: string[] = Array.isArray(user?.permissions)
            ? user.permissions.map((p: any) => p.name)
            : [];
        if (permissions.includes(requiredPermission)) return true;

        throw new ForbiddenException('Bạn không có quyền truy cập. Hãy thêm quyền và quay lại sau.');
    }
}
