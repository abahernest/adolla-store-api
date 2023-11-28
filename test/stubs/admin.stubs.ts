import {
  Admin,
  AdminAccountStatus,
  AdminRoleTypes,
} from '../../src/admin/entities/admin.entity';
import { DefaultSuperUserInfo } from '../../src/utils/constants';

export const adminStubs = (): Admin[] => {
  return [
    activeAdminStub1(),
    deletedAdminStub1(),
    activeAdminStub2(),
    activeAdminStub3(),
  ];
};

export const activeAdminStub1 = (): Admin => {
  return {
    firstname: 'John',
    lastname: 'Doe',
    email: 'johndoe1@email.com',
    password: 'P@ssw0rdActiveAdminFirst1234',
    role: AdminRoleTypes.ADMIN,
    status: AdminAccountStatus.ACTIVE,
  };
};

export const activeAdminStub2 = (): Admin => {
  return {
    firstname: 'John',
    lastname: 'Doe',
    email: 'johndoe2@email.com',
    password: 'P@ssw0rdActiveAdminSecond1234',
    role: AdminRoleTypes.ADMIN,
    status: AdminAccountStatus.ACTIVE,
  };
};

export const activeAdminStub3 = (): Admin => {
  return {
    firstname: 'John',
    lastname: 'Doe',
    email: 'johndoe.deleted2@email.com',
    password: 'P@ssw0rdInactiveAdminSecond1234',
    role: AdminRoleTypes.ADMIN,
    status: AdminAccountStatus.ACTIVE,
  };
};

export const deletedAdminStub1 = (): Admin => {
  return {
    firstname: 'John',
    lastname: 'Doe',
    email: 'johndoe.deleted1@email.com',
    password: 'P@ssw0rdInactiveAdminFirst1234',
    role: AdminRoleTypes.ADMIN,
    status: AdminAccountStatus.DELETED,
  };
};

export const defaultSuperAdminStub = (): Admin => {
  return DefaultSuperUserInfo as Admin;
};
