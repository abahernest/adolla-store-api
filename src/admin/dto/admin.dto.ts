import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { AdminIdExists } from '../validators/admin-id-exists';
import { AdminEmailNotRegistered } from '../validators/admin-email-not-registered';
import { AdminAccountStatus, AdminRoleTypes } from '../entities/admin.entity';

export class AdminDto {
  @IsString()
  @IsNotEmpty()
  firstname!: string;
  @IsString()
  @IsNotEmpty()
  lastname!: string;
  @IsString()
  @IsEmail()
  @AdminEmailNotRegistered()
  email!: string;
  @IsString()
  @IsStrongPassword(
    {
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minLength: 8,
    },
    {
      message:
        'password length must be above 8 and must have at least 1 lowercase, 1 uppercase, and 1 symbol ',
    },
  )
  password!: string;
  role!: AdminRoleTypes;
  status?: AdminAccountStatus;
}

export class AdminIdDto {
  @IsString()
  @IsNotEmpty()
  @AdminIdExists()
  admin_id: string;
}
