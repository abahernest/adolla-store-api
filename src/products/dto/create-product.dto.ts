import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Price } from '../entities/product.entity';
import { Type } from 'class-transformer';
import { ProductIdExists } from '../validators/product-id-exists';
import { CategoryIdExists } from '../validators/category-id-exists';
import { Currency } from '../../utils/constants';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @CategoryIdExists()
  category_id: string;
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsNumber()
  @Min(1)
  quantity: number;
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => Price)
  @ValidateNested()
  price: Price;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @CategoryIdExists()
  category_id: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity: number;
  @IsOptional()
  @IsNotEmptyObject()
  @Type(() => Price)
  @ValidateNested()
  price: Price;
}

export class ProductIdDto {
  @IsString()
  @IsNotEmpty()
  @ProductIdExists()
  product_id: string;
}

export enum SortIndex {
  createdAt = 'DATE',
  'price.amount' = 'PRICE',
  title = 'TITLE',
  quantity = 'QUANTITY',
}

export enum SortDirection {
  ASC = 1,
  DESC = -1,
}

export class PaginationDto {
  page_number?: number = 1;
  limit?: number = 10;
  sort?: 1 | -1 = -1;
  search?: string = '';
  category_id?: string = '';
  min_price?: number = 0;
  max_price?: number;
  currency?: Currency = Currency.NGN;
  sort_direction?: SortDirection = SortDirection.ASC;
  sort_index?: SortIndex = SortIndex.createdAt;
}

export class PaginatedResponseDto {
  meta: {
    page_number?: number;
    limit?: number;
    total?: number;
  };
  data: any;
}
