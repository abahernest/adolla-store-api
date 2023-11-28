import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DatabaseService } from '../src/database/database.service';
import { AppModule } from '../src/app.module';
import { useContainer } from 'class-validator';
import { LoginResponse } from '../src/auth/dto/auth.dto';
import { activeAdminStub3 } from './stubs/admin.stubs';
import { AdminService } from '../src/admin/admin.service';
import { ProductsService } from '../src/products/products.service';
import { UsersService } from '../src/users/users.service';
import { activeUserStub3 } from './stubs/users.stubs';
import { CreateProductCategoryDto } from '../src/products/dto/create-category.dto';
import { categoryStubs } from './stubs/category.stubs';
import { CategoryService } from '../src/products/category.service';
import {
  CreateProductDto,
  PaginatedResponseDto,
  UpdateProductDto,
} from '../src/products/dto/create-product.dto';
import { productStubs } from './stubs/product.stubs';
import { Currency } from '../src/utils/constants';
import { ProductStatus } from '../src/products/entities/product.entity';

const routes = {
  createProduct: {
    method: 'POST',
    path: '/products',
    describe: 'create product',
  },
  fetchAllProducts: {
    method: 'GET',
    path: '/products',
    describe: 'fetch all products',
  },
  deleteProduct: {
    method: 'DELETE',
    path: '/products/',
    describe: 'soft delete product',
  },
  updateProduct: {
    method: 'PATCH',
    path: '/products/',
    describe: 'modify product details',
  },
  createCategory: {
    method: 'POST',
    path: '/products/category',
    describe: 'create category for product',
  },
  fetchCategories: {
    method: 'GET',
    path: '/products/categories',
    describe: 'fetch all product categories',
  },
};

const getTestName = (p: keyof typeof routes) =>
  `[${routes[p].method}] ${routes[p].path} (${routes[p].describe})`;
const getRoutePath = (p: keyof typeof routes, postfix?: string): string =>
  postfix ? routes[p].path.concat(postfix) : routes[p].path;

describe('ProductsController', () => {
  let app: INestApplication;
  let productsService: ProductsService, categoryService: CategoryService;
  let adminService: AdminService, usersService: UsersService;
  let categoryId: string, productId: string;
  let adminBearerToken: string, userBearerToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    await app.init();

    productsService = await app.get(ProductsService);
    adminService = await app.get(AdminService);
    usersService = await app.get(UsersService);
    categoryService = await app.get(CategoryService);

    return app.get(DatabaseService).clearTestDB();
  }, 30000);

  afterAll(async () => {
    return await app.close();
  }, 10000);

  const postResponse = (path: string) =>
    request(app.getHttpServer()).post(path);
  const patchResponse = (path: string) =>
    request(app.getHttpServer()).patch(path);
  const deleteResponse = (path: string) =>
    request(app.getHttpServer()).delete(path);
  const getResponse = (path: string) => request(app.getHttpServer()).get(path);

  describe(getTestName('createCategory'), () => {
    const [categoryStub1, categoryStub2] = categoryStubs();

    beforeAll(async () => {
      // create super-admin (Usually seeded with database when AdminService was initialized)
      await adminService.create(activeAdminStub3());
      await usersService.create(activeUserStub3());
      // await categoryService.create(categoryStub2);

      // admin-login
      const { body }: { body: LoginResponse } = await request(
        app.getHttpServer(),
      )
        .post('/auth/admin-login')
        .send({
          email: activeAdminStub3().email,
          password: activeAdminStub3().password,
        });
      adminBearerToken = body.access_token;

      // user-login
      const { body: userLoginResp }: { body: LoginResponse } = await request(
        app.getHttpServer(),
      )
        .post('/auth/login')
        .send({
          email: activeUserStub3().email,
          password: activeUserStub3().password,
        });
      userBearerToken = userLoginResp.access_token;
    });

    it('Admin needs to login to create category', async () => {
      const categoryDto: CreateProductCategoryDto = {
        title: categoryStub1.title,
        description: categoryStub1.description,
      };

      const { status, body } = await postResponse(
        getRoutePath('createCategory'),
      ).send(categoryDto);

      expect(status).toBe(401);
      expect(body.message).toEqual('no auth token provided');
    });

    it('User cannot create category', async () => {
      const categoryDto: CreateProductCategoryDto = {
        title: categoryStub1.title,
        description: categoryStub1.description,
      };

      const { status, body } = await postResponse(
        getRoutePath('createCategory'),
      )
        .send(categoryDto)
        .auth(userBearerToken, { type: 'bearer' });

      expect(status).toBe(401);
      expect(body.message).toEqual('permission denied');
    });

    it('Admin can not create category without title', async () => {
      const categoryDto: Partial<CreateProductCategoryDto> = {
        description: categoryStub1.description,
      };
      const { status, body } = await postResponse(
        getRoutePath('createCategory'),
      )
        .send(categoryDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(2);
      expect(JSON.stringify(body.message)).toContain('title');
    });

    it('Admin can not create category with empty title', async () => {
      const categoryDto: Partial<CreateProductCategoryDto> = {
        title: '',
        description: categoryStub1.description,
      };
      const { status, body } = await postResponse(
        getRoutePath('createCategory'),
      )
        .send(categoryDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('title');
    });

    it('Admin can not create category with empty description', async () => {
      const categoryDto: Partial<CreateProductCategoryDto> = {
        title: categoryStub1.title,
        description: '',
      };
      const { status, body } = await postResponse(
        getRoutePath('createCategory'),
      )
        .send(categoryDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('description');
    });

    it('Admin can successfully create category without description', async () => {
      const categoryDto: Partial<CreateProductCategoryDto> = {
        title: categoryStub1.title,
      };
      const { status, body } = await postResponse(
        getRoutePath('createCategory'),
      )
        .send(categoryDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(201);
      expect(body.title.toLowerCase()).toStrictEqual(
        categoryDto.title.toLowerCase(),
      );
      expect(body.description).toBeFalsy();
    });

    it('Admin can successfully create category with description', async () => {
      const categoryDto: Partial<CreateProductCategoryDto> = {
        title: categoryStub2.title,
        description: categoryStub2.description,
      };
      const { status, body } = await postResponse(
        getRoutePath('createCategory'),
      )
        .send(categoryDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(201);
      expect(body.title.toLowerCase()).toStrictEqual(
        categoryDto.title.toLowerCase(),
      );
      expect(body.description.toLowerCase()).toStrictEqual(
        categoryDto.description.toLowerCase(),
      );
    });

    it('Admin can not create category with existing title', async () => {
      const categoryDto: CreateProductCategoryDto = {
        title: categoryStub2.title,
        description: categoryStub2.description,
      };
      const { status, body } = await postResponse(
        getRoutePath('createCategory'),
      )
        .send(categoryDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('already exists');
    });
  });

  describe(getTestName('fetchCategories'), () => {
    it('Login required to view categories', async () => {
      const { status, body } = await getResponse(
        getRoutePath('fetchCategories'),
      );

      expect(status).toBe(401);
      expect(body.message).toEqual('no auth token provided');
    });

    it('Logged admin can view categories', async () => {
      const { status, body }: { status: number; body: PaginatedResponseDto } =
        await getResponse(getRoutePath('fetchCategories')).auth(
          adminBearerToken,
          { type: 'bearer' },
        );

      expect(status).toBe(200);
      expect(body.data.length).toEqual(2);
      expect(body.data[0].title.toLowerCase()).toEqual(
        categoryStubs()[0].title.toLowerCase(),
      ); // alphabetical sorting
      expect(body.data[1].title.toLowerCase()).toEqual(
        categoryStubs()[1].title.toLowerCase(),
      );
    });

    it('Logged user can view categories', async () => {
      const { status, body }: { status: number; body: PaginatedResponseDto } =
        await getResponse(getRoutePath('fetchCategories')).auth(
          userBearerToken,
          { type: 'bearer' },
        );

      expect(status).toBe(200);
      expect(body.data.length).toEqual(2);
      expect(body.data[0].title.toLowerCase()).toEqual(
        categoryStubs()[0].title.toLowerCase(),
      ); // alphabetical sorting
      expect(body.data[1].title.toLowerCase()).toEqual(
        categoryStubs()[1].title.toLowerCase(),
      );
    });

    it('Logged user can paginate categories', async () => {
      const { status, body }: { status: number; body: PaginatedResponseDto } =
        await getResponse(getRoutePath('fetchCategories'))
          .auth(userBearerToken, { type: 'bearer' })
          .query({ limit: 1 })
          .query({ page_number: 2 });

      expect(status).toBe(200);
      expect(body.data.length).toEqual(1);
      expect(body.data[0].title.toLowerCase()).toEqual(
        categoryStubs()[1].title.toLowerCase(),
      );
    });
  });

  describe(getTestName('createProduct'), () => {
    const [, categoryStub2] = categoryStubs();
    let productStub1: CreateProductDto, productStub2: CreateProductDto;
    beforeAll(async () => {
      const category = await categoryService.findByTitle(categoryStub2.title);
      categoryId = category._id.toString();

      [productStub1, productStub2] = productStubs([categoryId]);
    });

    it('Admin needs to login to create product', async () => {
      const productDto: CreateProductDto = {
        title: productStub1.title,
        description: productStub1.description,
        category_id: productStub1.category_id,
        quantity: productStub1.quantity,
        price: productStub1.price,
      };

      const { status, body } = await postResponse(
        getRoutePath('createProduct'),
      ).send(productDto);

      expect(status).toBe(401);
      expect(body.message).toEqual('no auth token provided');
    });

    it('User cannot create product', async () => {
      const productDto: CreateProductDto = {
        title: productStub1.title,
        description: productStub1.description,
        category_id: productStub1.category_id,
        quantity: productStub1.quantity,
        price: productStub1.price,
      };

      const { status, body } = await postResponse(getRoutePath('createProduct'))
        .send(productDto)
        .auth(userBearerToken, { type: 'bearer' });

      expect(status).toBe(401);
      expect(body.message).toEqual('permission denied');
    });

    it('Admin can not create product without title', async () => {
      const productDto: Partial<CreateProductDto> = {
        description: productStub1.description,
        category_id: productStub1.category_id,
        quantity: productStub1.quantity,
        price: productStub1.price,
      };
      const { status, body } = await postResponse(getRoutePath('createProduct'))
        .send(productDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(2);
      expect(JSON.stringify(body.message)).toContain('title');
    });

    it('Admin can not create product with empty title', async () => {
      const productDto: CreateProductDto = {
        title: '',
        description: productStub1.description,
        category_id: productStub1.category_id,
        quantity: productStub1.quantity,
        price: productStub1.price,
      };
      const { status, body } = await postResponse(getRoutePath('createProduct'))
        .send(productDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('title');
    });

    it('Admin can not create product without category_id', async () => {
      const productDto: Partial<CreateProductDto> = {
        title: productStub1.title,
        description: productStub1.description,
        quantity: productStub1.quantity,
        price: productStub1.price,
      };
      const { status, body } = await postResponse(getRoutePath('createProduct'))
        .send(productDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(4);
      expect(JSON.stringify(body.message)).toContain('category_id');
    });

    it('Admin can not create product with empty category_id', async () => {
      const productDto: CreateProductDto = {
        title: productStub1.title,
        description: productStub1.description,
        category_id: '',
        quantity: productStub1.quantity,
        price: productStub1.price,
      };
      const { status, body } = await postResponse(getRoutePath('createProduct'))
        .send(productDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(3);
      expect(JSON.stringify(body.message)).toContain('category_id');
    });

    it('Admin can not create product with category_id that dont exist', async () => {
      const productDto: CreateProductDto = {
        title: productStub1.title,
        description: productStub1.description,
        category_id: '6560ec1506a78e17b7f9e851',
        quantity: productStub1.quantity,
        price: productStub1.price,
      };
      const { status, body } = await postResponse(getRoutePath('createProduct'))
        .send(productDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('does not exist');
    });

    it('Admin can not create product with empty description', async () => {
      const productDto: CreateProductDto = {
        title: productStub1.title,
        description: '',
        category_id: productStub1.category_id,
        quantity: productStub1.quantity,
        price: productStub1.price,
      };
      const { status, body } = await postResponse(getRoutePath('createProduct'))
        .send(productDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('description');
    });

    it('Admin can not create product with quantity < 1', async () => {
      const productDto: CreateProductDto = {
        title: productStub1.title,
        description: productStub1.description,
        category_id: productStub1.category_id,
        quantity: -1,
        price: productStub1.price,
      };
      const { status, body } = await postResponse(getRoutePath('createProduct'))
        .send(productDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(1);
      expect(JSON.stringify(body.message)).toContain('quantity');
    });

    it('Admin can not create product with wrong currency and price < 0', async () => {
      const productDto: CreateProductDto = {
        title: productStub1.title,
        description: productStub1.description,
        category_id: productStub1.category_id,
        quantity: productStub1.quantity,
        price: { amount: -1, currency: 'TZR' as Currency },
      };
      const { status, body } = await postResponse(getRoutePath('createProduct'))
        .send(productDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(400);
      expect(body.message).toHaveLength(2);
      expect(JSON.stringify(body.message)).toContain('currency');
      expect(JSON.stringify(body.message)).toContain('amount');
    });

    it('Admin can successfully create product without description or price object', async () => {
      const productDto: Partial<CreateProductDto> = {
        title: productStub2.title,
        category_id: productStub2.category_id,
        quantity: productStub2.quantity,
      };
      const { status, body } = await postResponse(getRoutePath('createProduct'))
        .send(productDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(201);
      expect(body).toEqual(productDto);
    });

    it('Admin can successfully create product', async () => {
      const productDto: Partial<CreateProductDto> = {
        title: productStub1.title,
        category_id: productStub1.category_id,
        quantity: productStub1.quantity,
        description: productStub1.description,
        price: productStub1.price,
      };
      const { status, body } = await postResponse(getRoutePath('createProduct'))
        .send(productDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(201);
      expect(body).toEqual(productDto);
    });
  });

  describe(getTestName('updateProduct'), () => {
    const [categoryStub1] = categoryStubs();
    let productStub1: CreateProductDto;
    beforeAll(async () => {
      const category = await categoryService.findByTitle(categoryStub1.title);
      categoryId = category._id.toString();

      [productStub1] = productStubs([categoryId]);

      const product = await productsService.create(productStub1);
      productId = product._id.toString();
    });

    it('Admin needs to login to modify product', async () => {
      const productDto: UpdateProductDto = {
        title: productStub1.title,
        description: productStub1.description,
        category_id: productStub1.category_id,
        quantity: productStub1.quantity,
        price: productStub1.price,
      };

      const { status, body } = await patchResponse(
        getRoutePath('updateProduct').concat(productId),
      ).send(productDto);

      expect(status).toBe(401);
      expect(body.message).toEqual('no auth token provided');
    });

    it('User cannot modify product', async () => {
      const productDto: CreateProductDto = {
        title: productStub1.title,
        description: productStub1.description,
        category_id: productStub1.category_id,
        quantity: productStub1.quantity,
        price: productStub1.price,
      };

      const { status, body } = await patchResponse(
        getRoutePath('updateProduct').concat(productId),
      )
        .send(productDto)
        .auth(userBearerToken, { type: 'bearer' });

      expect(status).toBe(401);
      expect(body.message).toEqual('permission denied');
    });

    it('Admin can successfully modify only product title', async () => {
      const productDto: Partial<UpdateProductDto> = {
        title: productStub1.title.concat(' modified'),
      };
      const { status, body } = await patchResponse(
        getRoutePath('updateProduct').concat(productId),
      )
        .send(productDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(200);

      // find product and confirm it was modified
      const product = await productsService.findById(productId);
      expect(productDto.title.toLowerCase()).toEqual(
        product.title.toLowerCase(),
      );
    });

    it('Admin can successfully modify only product description', async () => {
      const productDto: Partial<UpdateProductDto> = {
        description: productStub1.description.concat(' modified'),
      };
      const { status } = await patchResponse(
        getRoutePath('updateProduct').concat(productId),
      )
        .send(productDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(200);

      // find product and confirm it was modified
      const product = await productsService.findById(productId);
      expect(productDto.description.toLowerCase()).toEqual(
        product.description.toLowerCase(),
      );
    });

    it('Admin can successfully modify only product quantity', async () => {
      const productDto: Partial<UpdateProductDto> = {
        quantity: productStub1.quantity + 15,
      };
      const { status } = await patchResponse(
        getRoutePath('updateProduct').concat(productId),
      )
        .send(productDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(200);

      // find product and confirm it was modified
      const product = await productsService.findById(productId);
      expect(productDto.quantity).toEqual(product.quantity);
    });

    it('Admin can successfully modify only product price', async () => {
      const productDto: Partial<UpdateProductDto> = {
        price: {
          amount: productStub1.price.amount,
          currency: Currency.GBP,
        },
      };
      const { status } = await patchResponse(
        getRoutePath('updateProduct').concat(productId),
      )
        .send(productDto)
        .auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(200);

      // find product and confirm it was modified
      const product = await productsService.findById(productId);
      expect(productDto.price).toEqual(product.price);
    });
  });

  describe(getTestName('deleteProduct'), () => {
    const [categoryStub1] = categoryStubs();
    let productStub3: CreateProductDto;
    beforeAll(async () => {
      const category = await categoryService.findByTitle(categoryStub1.title);
      categoryId = category._id.toString();

      [, , productStub3] = productStubs([categoryId]);

      const product = await productsService.create(productStub3);
      productId = product._id.toString();
    });

    it('Admin needs to login to delete product', async () => {
      const { status, body } = await deleteResponse(
        getRoutePath('deleteProduct').concat(productId),
      );

      expect(status).toBe(401);
      expect(body.message).toEqual('no auth token provided');
    });

    it('User cannot delete product', async () => {
      const { status, body } = await deleteResponse(
        getRoutePath('deleteProduct').concat(productId),
      ).auth(userBearerToken, { type: 'bearer' });

      expect(status).toBe(401);
      expect(body.message).toEqual('permission denied');
    });

    it('Admin can successfully delete product', async () => {
      const { status } = await deleteResponse(
        getRoutePath('deleteProduct').concat(productId),
      ).auth(adminBearerToken, { type: 'bearer' });

      expect(status).toBe(200);

      // find product and confirm it was deleted
      const product = await productsService.findById(productId);
      expect(product.status).toEqual(ProductStatus.DELETED);
    });
  });
});
