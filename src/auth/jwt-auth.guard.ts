import {
  ExecutionContext,
  Injectable,
  Logger,
  SetMetadata,
  CanActivate,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { JwtPayloadType } from './dto/auth.dto';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_ADMIN_KEY = 'isAdmin';
export const AdminAuthGuard = () => SetMetadata(IS_ADMIN_KEY, true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  logger: Logger;
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
  ) {
    this.logger = new Logger('JwtAuthGuard');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // PUBLIC ROUTES
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (isPublic) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw Error('no auth token provided');
      }

      // assign current user to the request object making it available to route handlers
      request['user'] =
        await this.authService.getUserFromAuthenticationToken(token);

      // ADMIN ROUTES
      const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isAdmin && request.user.type != JwtPayloadType.ADMIN) {
        throw Error('permission denied');
      }
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
