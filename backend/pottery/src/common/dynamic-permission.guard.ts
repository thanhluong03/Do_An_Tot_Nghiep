import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class DynamicPermissionGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const permissions: string[] = user?.permissions?.map((p: any) => p.name) || [];
        const path = request.route?.path || request.originalUrl;
        if (!permissions.includes(path)) {
            throw new ForbiddenException('Bạn không có quyền truy cập. Hãy thêm quyền và quay lại sau.');
        }
        return true;
    }
}
