import { Body, Controller, Post } from '@nestjs/common';
import {
  JwtPayload,
  JwtPayloadType,
  LoginDto,
  LoginResponse,
} from './dto/auth.dto';
import { Public } from './jwt-auth.guard';
import { ErrorLogger } from '../utils/errors';
import { AdminAccountStatus } from '../admin/entities/admin.entity';
import { correctPassword } from '../utils/passwords';
import { AdminService } from '../admin/admin.service';
import { UserAccountStatus } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  logger: ErrorLogger;
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.logger = new ErrorLogger('AuthController');
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    try {
      const user = await this.usersService.findByEmail(loginDto.email, true);

      if (user) {
        if (user.status != UserAccountStatus.ACTIVE) {
          throw new Error(
            `403:-Forbidden:-account ${user.status.toLowerCase()}`,
          );
        }

        if (correctPassword(loginDto.password, user.password)) {
          const payload: JwtPayload = {
            sub: user._id.toString(),
            type: JwtPayloadType.CLIENT,
          };

          return {
            access_token: this.jwtService.sign(payload),
            user: {
              _id: user._id.toString(),
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
            },
          };
        }
      }

      throw new Error('400:-Bad Request:-wrong user credentials');
    } catch (e) {
      this.logger.handleError(`an error occurred during client login`, e);
    }
  }

  @Public()
  @Post('admin-login')
  async adminLogin(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    try {
      const admin = await this.adminService.findByEmail(loginDto.email, true);
      if (admin) {
        if (admin.status !== AdminAccountStatus.ACTIVE) {
          throw new Error(
            `403:-Forbidden:-account ${admin.status.toLowerCase()}`,
          );
        }
        if (correctPassword(loginDto.password, admin.password)) {
          const payload: JwtPayload = {
            sub: admin._id.toString(),
            type: JwtPayloadType.ADMIN,
          };

          return {
            access_token: this.jwtService.sign(payload),
            user: {
              _id: admin._id.toString(),
              firstname: admin.firstname,
              lastname: admin.lastname,
              email: admin.email,
              role: admin.role,
            },
          };
        }
      }

      throw new Error('400:-Bad Request:-wrong user credentials');
    } catch (e) {
      this.logger.handleError(`an error occurred during admin login`, e);
    }
  }
}
