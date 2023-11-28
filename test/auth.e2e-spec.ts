import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { LoginDto } from '../src/auth/dto/auth.dto';
import { LoginResponse } from '../src/auth/dto/auth.dto';
import { activeUserStub1, deletedUserStub1 } from './stubs/users.stubs';
import { DatabaseService } from '../src/database/database.service';
import { UsersService } from '../src/users/users.service';
import { UserDto } from '../src/users/dto/user.dto';
import { activeAdminStub1, deletedAdminStub1 } from './stubs/admin.stubs';
import { AdminService } from '../src/admin/admin.service';
import { AppModule } from '../src/app.module';
import { AdminDto } from '../src/admin/dto/admin.dto';

const routes = {
  login: {
    method: 'POST',
    path: '/auth/login',
    describe: 'user login via email',
  },
  adminLogin: {
    method: 'POST',
    path: '/auth/admin-login',
    describe: 'admin login via email',
  },
};

const getTestName = (p: keyof typeof routes) =>
  `[${routes[p].method}] ${routes[p].path} (${routes[p].describe})`;
const getRoutePath = (p: keyof typeof routes, postfix?: string): string =>
  postfix ? routes[p].path.concat(postfix) : routes[p].path;

describe('AuthController', () => {
  let app: INestApplication;
  let adminService: AdminService;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    adminService = await app.get(AdminService);
    usersService = await app.get(UsersService);

    return app.get(DatabaseService).clearTestDB();
  }, 30000);

  afterAll(async () => {
    return await app.close();
  }, 10000);

  const postResponse = (path: string) =>
    request(app.getHttpServer()).post(path);

  describe(getTestName('login'), () => {
    const activeUser: UserDto = activeUserStub1();
    const inactiveUser: UserDto = deletedUserStub1();
    beforeAll(async () => {
      await usersService.create(activeUserStub1());
      await usersService.create(deletedUserStub1());
    });

    it('User can successfully login', async () => {
      const loginDto: LoginDto = {
        email: activeUser.email,
        password: activeUser.password,
      };
      const { body, status } = await postResponse(getRoutePath('login')).send(
        loginDto,
      );
      expect(status).toBe(201);
      expect(body).toBeDefined();
      expect(body.user).toBeDefined();
      expect(body.user.email).toEqual(loginDto.email);
      expect(body.user.password).toBeFalsy();
      expect(body.access_token).toBeTruthy();
    });

    it('User can not login without email', async () => {
      const loginDto: Partial<LoginDto> = {
        password: activeUser.password,
      };
      const { status } = await postResponse(getRoutePath('login')).send(
        loginDto,
      );
      expect(status).toBe(400);
    });

    it('User can not login without password', async () => {
      const loginDto: Partial<LoginDto> = {
        email: activeUser.email,
      };
      const { status } = await postResponse(getRoutePath('login')).send(
        loginDto,
      );
      expect(status).toBe(400);
    });

    it('User can not login with incorrect password', async () => {
      const loginDto: Partial<LoginDto> = {
        email: activeUser.email,
        password: 'obviously long incorrect password',
      };
      const { status } = await postResponse(getRoutePath('login')).send(
        loginDto,
      );
      expect(status).toBe(400);
    });

    it('User can not login if account is inactive', async () => {
      const loginDto: Partial<LoginDto> = {
        email: inactiveUser.email,
        password: inactiveUser.password,
      };
      const { status } = await postResponse(getRoutePath('login')).send(
        loginDto,
      );
      expect(status).toBe(403);
    });
  });

  describe(getTestName('adminLogin'), () => {
    const activeAdmin: AdminDto = activeAdminStub1();
    const inactiveAdmin: AdminDto = deletedAdminStub1();
    beforeAll(async () => {
      await adminService.create(activeAdminStub1());
      await adminService.create(deletedAdminStub1());
    });

    it('Admin can successfully login', async () => {
      const loginDto: LoginDto = {
        email: activeAdmin.email,
        password: activeAdmin.password,
      };

      const { body, status }: { body: LoginResponse; status: number } =
        await postResponse(getRoutePath('adminLogin')).send(loginDto);
      expect(status).toBe(201);
      expect(body.access_token).toBeDefined();
      expect(body.user.email).toEqual(activeAdmin.email);
    });

    it('Admin can not login without email', async () => {
      const loginDto: Partial<LoginDto> = {
        password: activeAdmin.password,
      };
      const { status } = await postResponse(getRoutePath('adminLogin')).send(
        loginDto,
      );
      expect(status).toBe(400);
    });

    it('Admin can not login without password', async () => {
      const loginDto: Partial<LoginDto> = {
        email: activeAdmin.email,
      };
      const { status } = await postResponse(getRoutePath('adminLogin')).send(
        loginDto,
      );
      expect(status).toBe(400);
    });

    it('Admin can not login with incorrect password', async () => {
      const loginDto: LoginDto = {
        email: activeAdmin.email,
        password: 'obviously long incorrect password',
      };
      const { status } = await postResponse(getRoutePath('adminLogin')).send(
        loginDto,
      );
      expect(status).toBe(400);
    });

    it('Admin can not login if account is inactive', async () => {
      const loginDto: LoginDto = {
        email: inactiveAdmin.email,
        password: inactiveAdmin.password,
      };
      const { status } = await postResponse(getRoutePath('adminLogin')).send(
        loginDto,
      );
      expect(status).toBe(403);
    });
  });
});
