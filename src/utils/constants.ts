import { AdminDto } from '../admin/dto/admin.dto';
import {
  AdminAccountStatus,
  AdminRoleTypes,
} from '../admin/entities/admin.entity';

export const DefaultSuperUserInfo: AdminDto = {
  firstname: 'Ernest',
  lastname: 'Abah',
  email: 'dev@mainstack.co',
  password: 'P@ssw0rd',
  role: AdminRoleTypes.SUPER_ADMIN,
  status: AdminAccountStatus.ACTIVE,
};

export enum Currency {
  NGN = 'NGN',
  GBP = 'GBP',
  YEN = 'YEN',
  USD = 'USD',
}
