import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './entities/product.entity';
import { AdminModule } from '../admin/admin.module';
import { UsersModule } from '../users/users.module';
import { CategoryIdExistsConstraint } from './validators/category-id-exists';
import { CategoryService } from './category.service';
import {
  ProductCategory,
  ProductCategorySchema,
} from './entities/category.entity';
import { UniqueCategoryTitleConstraint } from './validators/unique-category-title';
import { ProductIdExistsConstraint } from './validators/product-id-exists';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductCategory.name, schema: ProductCategorySchema },
    ]),
    AdminModule,
    UsersModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductIdExistsConstraint,
    CategoryService,
    CategoryIdExistsConstraint,
    UniqueCategoryTitleConstraint,
  ],
  exports: [
    ProductsService,
    ProductIdExistsConstraint,
    CategoryService,
    CategoryIdExistsConstraint,
    UniqueCategoryTitleConstraint,
  ],
})
export class ProductsModule {}
