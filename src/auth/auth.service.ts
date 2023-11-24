import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CurrentUser, JwtPayload, JwtPayloadType } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private adminService: AdminService,
  ) {}

  public async getUserFromAuthenticationToken(
    token: string,
  ): Promise<CurrentUser> {
    try {
      const payload: JwtPayload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      switch (payload.type) {
        case JwtPayloadType.CLIENT:
          const user = await this.usersService.findActiveUser(payload.sub);
          if (!user) {
            throw new UnauthorizedException('user not found');
          }
          return { id: payload.sub, email: user.email, type: payload.type };

        case JwtPayloadType.ADMIN:
          const admin = await this.adminService.findActiveAdmin(payload.sub);
          if (!admin) {
            throw new UnauthorizedException('user not found');
          }
          return {
            id: payload.sub,
            email: admin.email,
            type: payload.type,
            role: admin.role,
          };

        default:
          throw new UnauthorizedException('invalid auth token');
      }
    } catch (e) {
      throw e;
    }
  }
}
