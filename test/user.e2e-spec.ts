import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { activeUserStub2, deletedUserStub2 } from './stubs/users.stubs';
import { DatabaseService } from '../src/database/database.service';
import { UsersService } from '../src/users/users.service';
import { ChangePasswordDto, UserDto } from '../src/users/dto/user.dto';
import { AppModule } from '../src/app.module';
import { useContainer } from 'class-validator';
import { LoginResponse } from '../src/auth/dto/auth.dto';

const routes = {
  signup: {
    method: 'POST',
    path: '/users/signup',
    describe: 'user signup',
  },
  changePassword: {
    method: 'PATCH',
    path: '/users/change-password',
    describe: 'change user password',
  },
  getUser: {
    method: 'GET',
    path: '/users/profile',
    describe: 'user profile',
  },
};

const getTestName = (p: keyof typeof routes) =>
  `[${routes[p].method}] ${routes[p].path} (${routes[p].describe})`;
const getRoutePath = (p: keyof typeof routes, postfix?: string): string =>
  postfix ? routes[p].path.concat(postfix) : routes[p].path;

describe('UsersController', () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    await app.init();

    usersService = await app.get(UsersService);

    return app.get(DatabaseService).clearTestDB();
  }, 30000);

  afterAll(async () => {
    return await app.close();
  }, 10000);

  const postResponse = (path: string) =>
    request(app.getHttpServer()).post(path);
  const patchResponse = (path: string) =>
    request(app.getHttpServer()).patch(path);
  const getResponse = (path: string) => request(app.getHttpServer()).get(path);

  describe(getTestName('signup'), () => {
    const activeUser: UserDto = activeUserStub2();
    const inactiveUser: UserDto = deletedUserStub2();
    beforeAll(async () => {
      await usersService.create(activeUserStub2());
    });

    it('User can not signup without email', async () => {
      const userDto: Partial<UserDto> = {
        firstname: inactiveUser.firstname,
        lastname: inactiveUser.lastname,
        password: inactiveUser.password,
      };
      const { status, body } = await postResponse(getRoutePath('signup')).send(
        userDto,
      );
      expect(status).toBe(400);
      expect(body.message).toHaveLength(2);
      expect(JSON.stringify(body.message)).toContain('email');
    });

    it('User can not signup with invalid email', async () => {
      const userDto: Partial<UserDto> = {
        email: 'invalidemail',
        firstname: inactiveUser.firstname,
        lastname: inactiveUser.lastname,
        password: inactiveUser.password,
      };
      const { status, body } = await postResponse(getRoutePath('signup')).send(
        userDto,
      );
      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('email');
    });

    it('User can not signup with existing email', async () => {
      const userDto: Partial<UserDto> = {
        email: activeUser.email,
        firstname: activeUser.firstname,
        lastname: activeUser.lastname,
        password: activeUser.password,
      };
      const { status, body } = await postResponse(getRoutePath('signup')).send(
        userDto,
      );
      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('email');
    });

    it('User can not signup without firstname', async () => {
      const userDto: Partial<UserDto> = {
        lastname: inactiveUser.lastname,
        email: inactiveUser.email,
        password: inactiveUser.password,
      };
      const { status, body } = await postResponse(getRoutePath('signup')).send(
        userDto,
      );
      expect(status).toBe(400);
      expect(body.message).toHaveLength(2);
      expect(JSON.stringify(body.message)).toContain('firstname');
    });

    it('User can not signup with empty firstname', async () => {
      const userDto: Partial<UserDto> = {
        firstname: '',
        lastname: inactiveUser.lastname,
        email: inactiveUser.email,
        password: inactiveUser.password,
      };
      const { status, body } = await postResponse(getRoutePath('signup')).send(
        userDto,
      );
      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('firstname');
    });

    it('User can not signup without lastname', async () => {
      const userDto: Partial<UserDto> = {
        firstname: inactiveUser.firstname,
        email: inactiveUser.email,
        password: inactiveUser.password,
      };
      const { status, body } = await postResponse(getRoutePath('signup')).send(
        userDto,
      );
      expect(status).toBe(400);
      expect(body.message).toHaveLength(2);
      expect(JSON.stringify(body.message)).toContain('lastname');
    });

    it('User can not signup with empty lastname', async () => {
      const userDto: Partial<UserDto> = {
        firstname: inactiveUser.firstname,
        lastname: '',
        email: inactiveUser.email,
        password: inactiveUser.password,
      };
      const { status, body } = await postResponse(getRoutePath('signup')).send(
        userDto,
      );
      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('lastname');
    });

    it('User can not signup with weak password', async () => {
      const userDto: Partial<UserDto> = {
        firstname: inactiveUser.firstname,
        lastname: inactiveUser.lastname,
        email: inactiveUser.email,
        password: 'weakasf',
      };
      const { status, body } = await postResponse(getRoutePath('signup')).send(
        userDto,
      );
      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('password');
    });

    it('User can successfully signup', async () => {
      const userDto: UserDto = {
        email: inactiveUser.email,
        password: inactiveUser.password,
        firstname: inactiveUser.firstname,
        lastname: inactiveUser.password,
      };
      const { body, status } = await postResponse(getRoutePath('signup')).send(
        userDto,
      );
      expect(status).toBe(201);
      expect(body).toBeDefined();
      expect(body.email).toEqual(inactiveUser.email);
      expect(body.password).toBeFalsy();
    });
  });

  describe(getTestName('getUser'), () => {
    const activeUser: UserDto = activeUserStub2();
    let userBearerToken: string;
    beforeAll(async () => {
      // user login
      const { body }: { body: LoginResponse } = await request(
        app.getHttpServer(),
      )
        .post('/auth/login')
        .send({ email: activeUser.email, password: activeUser.password });
      userBearerToken = body.access_token;
    });

    it('User needs to login to view profile', async () => {
      const { status, body } = await getResponse(getRoutePath('getUser'));
      expect(status).toBe(401);
      expect(body.message).toEqual('no auth token provided');
    });

    it('Logged user can view profile', async () => {
      const { status, body } = await getResponse(getRoutePath('getUser')).auth(
        userBearerToken,
        { type: 'bearer' },
      );

      expect(status).toBe(200);
      expect(body.email).toEqual(activeUser.email);
      expect(body.firstname.toLowerCase()).toBe(
        activeUser.firstname.toLowerCase(),
      );
      expect(body.lastname.toLowerCase()).toBe(
        activeUser.lastname.toLowerCase(),
      );
    });
  });

  describe(getTestName('changePassword'), () => {
    const activeUser: UserDto = activeUserStub2();
    const inactiveUser: UserDto = deletedUserStub2();
    let userBearerToken: string;
    beforeAll(async () => {
      // user login
      const { body }: { body: LoginResponse } = await request(
        app.getHttpServer(),
      )
        .post('/auth/login')
        .send({ email: activeUser.email, password: activeUser.password });
      userBearerToken = body.access_token;
    });

    it('User needs to login to change password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        old_password: activeUser.password,
        new_password: inactiveUser.password,
      };
      const { status, body } = await patchResponse(
        getRoutePath('changePassword'),
      ).send(changePasswordDto);
      expect(status).toBe(401);
      expect(body.message).toEqual('no auth token provided');
    });

    it('User can not change password without old_password', async () => {
      const changePasswordDto: Partial<ChangePasswordDto> = {
        new_password: inactiveUser.password,
      };

      const { status, body } = await patchResponse(
        getRoutePath('changePassword'),
      )
        .send(changePasswordDto)
        .auth(userBearerToken, { type: 'bearer' });
      expect(status).toBe(400);
      expect(body.message).toHaveLength(2);
      expect(JSON.stringify(body.message)).toContain('old_password');
    });

    it('User can not change password with empty old_password', async () => {
      const changePasswordDto: Partial<ChangePasswordDto> = {
        old_password: '',
        new_password: inactiveUser.password,
      };

      const { status, body } = await patchResponse(
        getRoutePath('changePassword'),
      )
        .send(changePasswordDto)
        .auth(userBearerToken, { type: 'bearer' });
      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('old_password');
    });

    it('User can not change password without new_password', async () => {
      const changePasswordDto: Partial<ChangePasswordDto> = {
        old_password: activeUser.password,
      };

      const { status, body } = await patchResponse(
        getRoutePath('changePassword'),
      )
        .send(changePasswordDto)
        .auth(userBearerToken, { type: 'bearer' });
      expect(status).toBe(400);
      expect(body.message).toHaveLength(3);
      expect(JSON.stringify(body.message)).toContain('new_password');
    });

    it('User can not change password with empty new_password', async () => {
      const changePasswordDto: Partial<ChangePasswordDto> = {
        old_password: activeUser.password,
        new_password: '',
      };

      const { status, body } = await patchResponse(
        getRoutePath('changePassword'),
      )
        .send(changePasswordDto)
        .auth(userBearerToken, { type: 'bearer' });
      expect(status).toBe(400);
      expect(body.message).toHaveLength(2);
      expect(JSON.stringify(body.message)).toContain('new_password');
    });

    it('User can not change password to weak password', async () => {
      const changePasswordDto: Partial<ChangePasswordDto> = {
        old_password: activeUser.password,
        new_password: 'weakasf',
      };

      const { status, body } = await patchResponse(
        getRoutePath('changePassword'),
      )
        .send(changePasswordDto)
        .auth(userBearerToken, { type: 'bearer' });
      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain(
        '1 lowercase, 1 uppercase, and 1 symbol',
      );
    });

    it('User can change password and confirm it works', async () => {
      const changePasswordDto: Partial<ChangePasswordDto> = {
        old_password: activeUser.password,
        new_password: inactiveUser.password,
      };

      const { status, body } = await patchResponse(
        getRoutePath('changePassword'),
      )
        .send(changePasswordDto)
        .auth(userBearerToken, { type: 'bearer' });
      expect(status).toBe(200);
      expect(body.message).toEqual('success');

      // Attempt login with old password
      const { body: loginBodyF, status: loginStatusF } = await request(
        app.getHttpServer(),
      )
        .post('/auth/login')
        .send({ email: activeUser.email, password: activeUser.password });

      expect(loginStatusF).toBe(400);
      expect(loginBodyF.message).toEqual('wrong user credentials');

      // Attempt login with new password
      const { body: loginBody, status: loginStatus } = await request(
        app.getHttpServer(),
      )
        .post('/auth/login')
        .send({ email: activeUser.email, password: inactiveUser.password });

      expect(loginStatus).toBe(201);
      expect(loginBody.user.email).toEqual(activeUser.email);
    });
  });
});
