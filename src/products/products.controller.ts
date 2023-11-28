import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  PaginatedResponseDto,
  PaginationDto,
  ProductIdDto,
  SortDirection,
  SortIndex,
  UpdateProductDto,
} from './dto/create-product.dto';
import { AdminAuthGuard } from '../auth/jwt-auth.guard';
import { ErrorLogger } from '../utils/errors';
import { AdminActivityService } from '../admin/admin-activity.service';
import { UsersService } from '../users/users.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AdminActivityType } from '../admin/entities/admin-activity.entity';
import { CategoryService } from './category.service';
import { CreateProductCategoryDto } from './dto/create-category.dto';
import { Currency } from '../utils/constants';

@Controller({ version: '1', path: 'products' })
export class ProductsController {
  private readonly logger: ErrorLogger;

  constructor(
    private readonly productsService: ProductsService,
    private readonly categoryService: CategoryService,
    private readonly adminActivityService: AdminActivityService,
    private readonly usersService: UsersService,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.logger = new ErrorLogger('ProductsController');
  }

  @AdminAuthGuard()
  @Post('')
  async create(@Body() createProductDto: CreateProductDto, @Request() req) {
    try {
      const session = await this.connection.startSession();

      async function _create() {
        const product = await this.productsService.create(
          createProductDto,
          session,
        );
        if (!product) {
          throw new Error(`400:-Bad Request:-could not create product`);
        }

        // activity trail
        const activity = await this.adminActivityService.create(
          {
            type: AdminActivityType.ADD_PRODUCT,
            comment: `Added New product.`,
            admin_id: req.user.id,
            extra_details: {
              product_id: product._id,
              more: createProductDto,
            },
          },
          session,
        );
        if (!activity) {
          throw new Error(
            `500:-Internal Server Error:-could not record ${AdminActivityType.ADD_PRODUCT} activity for admin ${req.user.id}`,
          );
        }
      }

      const boundedFunction = _create.bind(this);
      await session.withTransaction(boundedFunction);
      await session.endSession();
      return createProductDto;
    } catch (e) {
      this.logger.handleError(
        `an error occurred while creating product for user ${req.user.id}`,
        e,
      );
    }
  }

  @Get('')
  async fetchAllProducts(
    @Query('page_number') page_number: string = '1',
    @Query('limit') limit: string = '10',
    @Query('sort') sort: '-1' | '1' = '-1',
    @Query('search') search: string,
    @Query('category_id') category_id: string,
    @Query('min_price') min_price: string = '0',
    @Query('max_price') max_price: string,
    @Query('currency') currency: Currency = Currency.NGN,
    @Query('sort_direction') sort_direction: SortDirection = SortDirection.DESC,
    @Query('sort_index') sort_index: SortIndex = SortIndex.createdAt,
  ) {
    try {
      const paginationDto: PaginationDto = {
        limit: Number(limit),
        page_number: Number(page_number),
        sort: sort == '1' ? 1 : -1,
        search,
        category_id,
        min_price: Number(min_price),
        max_price: Number(max_price),
        currency,
        sort_direction,
        sort_index,
      };

      const output: PaginatedResponseDto = {
        meta: {
          limit: paginationDto.limit,
          page_number: paginationDto.page_number,
        },
        data: {},
      };

      if (search) {
        output.data = await this.productsService.searchProducts(paginationDto);
        return output;
      }

      output.data = await this.productsService.findAll(paginationDto);
      return output;
    } catch (e) {
      this.logger.handleError(`an error occurred while fetching products`, e);
    }
  }

  @AdminAuthGuard()
  @Patch(':product_id')
  async updateProduct(
    @Param() productIdDto: ProductIdDto,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
  ): Promise<UpdateProductDto> {
    try {
      const session = await this.connection.startSession();

      async function _updateProduct() {
        const product = await this.productsService.updateProduct(
          productIdDto.product_id,
          updateProductDto,
          session,
        );
        if (!product) {
          throw new Error(`400:-Bad Request:-could not modify product`);
        }

        // activity trail
        const activity = await this.adminActivityService.create(
          {
            type: AdminActivityType.EDIT_PRODUCT,
            comment: `Modified product`,
            admin_id: req.user.id,
            extra_details: {
              product_id: product._id,
              more: updateProductDto,
            },
          },
          session,
        );
        if (!activity) {
          throw new Error(
            `500:-Internal Server Error:-could not record ${AdminActivityType.EDIT_PRODUCT} activity for admin ${req.user.id}`,
          );
        }
      }

      const boundedTxFunction = _updateProduct.bind(this);
      await session.withTransaction(boundedTxFunction);
      await session.endSession();
      return updateProductDto;
    } catch (e) {
      this.logger.handleError(
        `an error occurred while modifying product with id ${productIdDto.product_id}`,
        e,
      );
    }
  }

  @AdminAuthGuard()
  @Delete(':product_id')
  async deleteProduct(@Param() productIdDto: ProductIdDto, @Request() req) {
    try {
      const session = await this.connection.startSession();

      async function _deleteProduct() {
        const product = await this.productsService.deleteProduct(
          productIdDto.product_id,
          session,
        );
        if (!product) {
          throw new Error(`400:-Bad Request:-could not delete product.`);
        }

        // activity trail
        const activity = await this.adminActivityService.create(
          {
            type: AdminActivityType.DELETE_PRODUCT,
            comment: `Deleted product.`,
            admin_id: req.user.id,
            extra_details: {
              product_id: product._id,
              more: product,
            },
          },
          session,
        );
        if (!activity) {
          throw new Error(
            `500:-Internal Server Error:-could not record ${AdminActivityType.DELETE_PRODUCT} activity for admin ${req.user.id}`,
          );
        }
      }

      const boundedTxFunction = _deleteProduct.bind(this);
      await session.withTransaction(boundedTxFunction);
      await session.endSession();
      return { message: 'success' };
    } catch (e) {
      this.logger.handleError(
        `an error occurred while deleting product with id ${productIdDto.product_id}`,
        e,
      );
    }
  }

  // CATEGORIES
  @AdminAuthGuard()
  @Post('category')
  async createCategory(
    @Body() createCategoryDto: CreateProductCategoryDto,
    @Request() req,
  ) {
    try {
      const session = await this.connection.startSession();

      async function _createCategory() {
        const category = await this.categoryService.create(
          createCategoryDto,
          session,
        );
        if (!category) {
          throw new Error(`400:-Bad Request:-could not create category`);
        }

        // activity trail
        const activity = await this.adminActivityService.create(
          {
            type: AdminActivityType.ADD_CATEGORY,
            comment: `Added New Category.`,
            admin_id: req.user.id,
            extra_details: {
              category_id: category._id,
              more: createCategoryDto,
            },
          },
          session,
        );
        if (!activity) {
          throw new Error(
            `500:-Internal Server Error:-could not record ${AdminActivityType.ADD_CATEGORY} activity for admin ${req.user.id}`,
          );
        }
      }
      const boundedFunction = _createCategory.bind(this);
      await session.withTransaction(boundedFunction);
      await session.endSession();

      return createCategoryDto;
    } catch (e) {
      this.logger.handleError(
        `an error occurred while creating product for user ${req.user.id}`,
        e,
      );
    }
  }

  @Get('categories')
  async fetchCategories(
    @Query('page_number') page_number: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string,
  ) {
    try {
      const paginationDto: PaginationDto = {
        limit: parseInt(limit),
        page_number: parseInt(page_number),
        search,
      };

      const output: PaginatedResponseDto = {
        meta: {
          limit: paginationDto.limit,
          page_number: paginationDto.page_number,
        },
        data: {},
      };

      if (search) {
        output.data =
          await this.categoryService.searchCategories(paginationDto);
        return output;
      }

      output.data = await this.categoryService.findAll(paginationDto);
      return output;
    } catch (e) {
      this.logger.handleError(
        `an error occurred while fetching product categories`,
        e,
      );
    }
  }
}
