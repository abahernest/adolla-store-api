import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UniqueCategoryTitle } from '../validators/unique-category-title';

export class CreateProductCategoryDto {
  @IsString()
  @IsNotEmpty()
  @UniqueCategoryTitle()
  title: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;
}
