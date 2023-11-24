import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AdminRoleTypes } from '../../admin/entities/admin.entity';

export class LoginDto {
  @IsString()
  @IsEmail()
  email!: string;
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export enum JwtPayloadType {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export class JwtPayload {
  sub: string; // id
  type: JwtPayloadType; // admin or client
}

export class CurrentUser {
  id: string;
  email: string;
  type: JwtPayloadType;
  role?: AdminRoleTypes;
}

export class LoginResponse {
  access_token: string;
  user: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    role?: string; // admin user
  };
}
