import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DatabaseService } from '../src/database/database.service';
import { AppModule } from '../src/app.module';
import { useContainer } from 'class-validator';
import { LoginResponse } from '../src/auth/dto/auth.dto';
import { activeAdminStub2, defaultSuperAdminStub } from './stubs/admin.stubs';
import { AdminDto } from '../src/admin/dto/admin.dto';
import { PaginatedResponseDto } from '../src/admin/dto/admin-activity.dto';
import { AdminService } from '../src/admin/admin.service';

const routes = {
  createAdmin: {
    method: 'POST',
    path: '/admin',
    describe: 'create admin user',
  },
  fetchActivityTrail: {
    method: 'GET',
    path: '/admin/:admin_id/activity-trail',
    describe: 'admin activity trail',
  },
};

const getTestName = (p: keyof typeof routes) =>
  `[${routes[p].method}] ${routes[p].path} (${routes[p].describe})`;
const getRoutePath = (p: keyof typeof routes, postfix?: string): string =>
  postfix ? routes[p].path.concat(postfix) : routes[p].path;

describe('AdminController', () => {
  let app: INestApplication;
  let adminService: AdminService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    await app.init();

    adminService = await app.get(AdminService);

    return app.get(DatabaseService).clearTestDB();
  }, 30000);

  afterAll(async () => {
    return await app.close();
  }, 10000);

  const postResponse = (path: string) =>
    request(app.getHttpServer()).post(path);
  const getResponse = (path: string) => request(app.getHttpServer()).get(path);

  describe(getTestName('createAdmin'), () => {
    const activeAdmin: AdminDto = activeAdminStub2();
    let adminBearerToken: string;

    beforeAll(async () => {
      // create super-admin (Usually seeded with database when AdminService was initialized)
      await adminService.create(defaultSuperAdminStub());

      const { body }: { body: LoginResponse } = await request(
        app.getHttpServer(),
      )
        .post('/auth/admin-login')
        .send({
          email: defaultSuperAdminStub().email,
          password: defaultSuperAdminStub().password,
        });
      adminBearerToken = body.access_token;
    });

    it('Admin needs to login to create another admin', async () => {
      const adminDto: Partial<AdminDto> = {
        email: activeAdmin.email,
        firstname: activeAdmin.firstname,
        lastname: activeAdmin.lastname,
        password: activeAdmin.password,
      };

      const { status, body } = await postResponse(
        getRoutePath('createAdmin'),
      ).send(adminDto);

      expect(status).toBe(401);
      expect(body.message).toEqual('no auth token provided');
    });

    it('Admin can not create another admin without email', async () => {
      const adminDto: Partial<AdminDto> = {
        firstname: activeAdmin.firstname,
        lastname: activeAdmin.lastname,
        password: activeAdmin.password,
      };
      const { status, body } = await postResponse(getRoutePath('createAdmin'))
        .send(adminDto)
        .auth(adminBearerToken, { type: 'bearer' });
      expect(status).toBe(400);
      expect(body.message).toHaveLength(2);
      expect(JSON.stringify(body.message)).toContain('email');
    });

    it('Admin can not create another admin with invalid email', async () => {
      const adminDto: Partial<AdminDto> = {
        email: 'invalidemail',
        firstname: activeAdmin.firstname,
        lastname: activeAdmin.lastname,
        password: activeAdmin.password,
      };
      const { status, body } = await postResponse(getRoutePath('createAdmin'))
        .send(adminDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('email');
    });

    it('Admin can not create another admin with existing email', async () => {
      const adminDto: Partial<AdminDto> = {
        email: defaultSuperAdminStub().email,
        firstname: defaultSuperAdminStub().firstname,
        lastname: defaultSuperAdminStub().lastname,
        password: defaultSuperAdminStub().password,
      };
      const { status, body } = await postResponse(getRoutePath('createAdmin'))
        .send(adminDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('email');
    });

    it('Admin can not create another admin without firstname', async () => {
      const adminDto: Partial<AdminDto> = {
        lastname: activeAdmin.lastname,
        email: activeAdmin.email,
        password: activeAdmin.password,
      };
      const { status, body } = await postResponse(getRoutePath('createAdmin'))
        .send(adminDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(2);
      expect(JSON.stringify(body.message)).toContain('firstname');
    });

    it('Admin can not create another admin with empty firstname', async () => {
      const adminDto: Partial<AdminDto> = {
        firstname: '',
        lastname: activeAdmin.lastname,
        email: activeAdmin.email,
        password: activeAdmin.password,
      };
      const { status, body } = await postResponse(getRoutePath('createAdmin'))
        .send(adminDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('firstname');
    });

    it('Admin can not create another admin without lastname', async () => {
      const adminDto: Partial<AdminDto> = {
        firstname: activeAdmin.firstname,
        email: activeAdmin.email,
        password: activeAdmin.password,
      };
      const { status, body } = await postResponse(getRoutePath('createAdmin'))
        .send(adminDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(2);
      expect(JSON.stringify(body.message)).toContain('lastname');
    });

    it('Admin can not create another admin with empty lastname', async () => {
      const adminDto: Partial<AdminDto> = {
        firstname: activeAdmin.firstname,
        lastname: '',
        email: activeAdmin.email,
        password: activeAdmin.password,
      };
      const { status, body } = await postResponse(getRoutePath('createAdmin'))
        .send(adminDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('lastname');
    });

    it('Admin can not create another admin with weak password', async () => {
      const adminDto: Partial<AdminDto> = {
        firstname: activeAdmin.firstname,
        lastname: activeAdmin.lastname,
        email: activeAdmin.email,
        password: 'weakasf',
      };
      const { status, body } = await postResponse(getRoutePath('createAdmin'))
        .send(adminDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('password');
    });

    it('Admin can successfully create another admin with working credentials', async () => {
      const adminDto: Partial<AdminDto> = {
        email: activeAdmin.email,
        password: activeAdmin.password,
        firstname: activeAdmin.firstname,
        lastname: activeAdmin.password,
      };
      const { body, status } = await postResponse(getRoutePath('createAdmin'))
        .send(adminDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(201);
      expect(body).toBeDefined();
      expect(body.email).toEqual(activeAdmin.email);
      expect(body.password).toBeFalsy();

      // Attempt login for new admin
      const { body: loginBody, status: loginStatus } = await request(
        app.getHttpServer(),
      )
        .post('/auth/admin-login')
        .send({ email: adminDto.email, password: adminDto.password });

      expect(loginStatus).toBe(201);
      expect(loginBody.user.email).toEqual(adminDto.email);
    });
  });

  describe(getTestName('fetchActivityTrail'), () => {
    const activeAdmin: AdminDto = activeAdminStub2();
    let adminBearerToken: string;
    let adminId: string;
    let superAdminId: string;
    beforeAll(async () => {
      // super-admin login
      const { body }: { body: LoginResponse } = await request(
        app.getHttpServer(),
      )
        .post('/auth/admin-login')
        .send({
          email: defaultSuperAdminStub().email,
          password: defaultSuperAdminStub().password,
        });

      adminBearerToken = body.access_token;
      superAdminId = body.user._id;

      // created admin login
      const { body: newAdminBody }: { body: LoginResponse } = await request(
        app.getHttpServer(),
      )
        .post('/auth/admin-login')
        .send({ email: activeAdmin.email, password: activeAdmin.password });

      adminId = newAdminBody.user._id;
    });

    it('Admin needs to login to view activity trail', async () => {
      const { status, body } = await getResponse(
        `/admin/${superAdminId}/activity-trail`,
      );

      expect(status).toBe(401);
      expect(body.message).toEqual('no auth token provided');
    });

    it('Logged admin can view his activity trail', async () => {
      const { status, body }: { status: number; body: PaginatedResponseDto } =
        await getResponse(`/admin/${superAdminId}/activity-trail`).auth(
          adminBearerToken,
          { type: 'bearer' },
        );

      expect(status).toBe(200);
      expect(body.meta.total).toEqual(1); // super admin has only performed 1 operation (create new admin)
      expect(body.data.length).toEqual(1);
    });

    it('Logged admin can view other admin activity trail', async () => {
      const { status, body }: { status: number; body: PaginatedResponseDto } =
        await getResponse(`/admin/${adminId}/activity-trail`).auth(
          adminBearerToken,
          { type: 'bearer' },
        );

      expect(status).toBe(200);
      expect(body.meta.total).toEqual(0); // new admin has not performed any operation
      expect(body.data.length).toEqual(0);
    });
  });
});
