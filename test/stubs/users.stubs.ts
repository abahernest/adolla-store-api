import { User, UserAccountStatus } from '../../src/users/entities/user.entity';

export const usersStubs = (): User[] => {
  return [
    activeUserStub1(),
    deletedUserStub1(),
    activeUserStub2(),
    deletedUserStub2(),
    activeUserStub3(),
  ];
};

export const activeUserStub1 = (): User => {
  return {
    firstname: 'John',
    lastname: 'Doe',
    email: 'johndoe1@email.com',
    password: 'P@ssw0rdActiveFirst1234',
    status: UserAccountStatus.ACTIVE,
  };
};

export const activeUserStub2 = (): User => {
  return {
    firstname: 'John',
    lastname: 'Doe',
    email: 'johndoe2@email.com',
    password: 'P@ssw0rdActiveSecond1234',
    status: UserAccountStatus.ACTIVE,
  };
};

export const activeUserStub3 = (): User => {
  return {
    firstname: 'John',
    lastname: 'Doe',
    email: 'johndoe3@email.com',
    password: 'P@ssw0rdActiveThird1234',
    status: UserAccountStatus.ACTIVE,
  };
};

export const deletedUserStub1 = (): User => {
  return {
    firstname: 'John',
    lastname: 'Doe',
    email: 'johndoe.deleted1@email.com',
    password: 'P@ssw0rdInactiveFirst1234',
    status: UserAccountStatus.DELETED,
  };
};

export const deletedUserStub2 = (): User => {
  return {
    firstname: 'John',
    lastname: 'Doe',
    email: 'johndoe.deleted2@email.com',
    password: 'P@ssw0rdInactiveSecond1234',
    status: UserAccountStatus.DELETED,
  };
};
