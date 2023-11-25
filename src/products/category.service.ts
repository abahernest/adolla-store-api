import { Injectable } from '@nestjs/common';
import { CreateProductCategoryDto } from './dto/create-category.dto';
import {
  ProductCategoryDocument,
  ProductCategory,
} from './entities/category.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationDto } from './dto/create-product.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(ProductCategory.name)
    private categoryModel: Model<ProductCategory>,
  ) {}

  async create(
    createProductCategoryDto: CreateProductCategoryDto,
  ): Promise<ProductCategoryDocument> {
    return this.categoryModel.create(createProductCategoryDto);
  }

  async findById(id: string): Promise<ProductCategoryDocument> {
    return this.categoryModel.findById(id);
  }

  async findByTitle(title: string): Promise<ProductCategoryDocument> {
    return this.categoryModel.findOne({ title });
  }

  async findAll(query: PaginationDto): Promise<ProductCategoryDocument[]> {
    return this.categoryModel.aggregate([
      { $sort: { title: 1 } },
      { $skip: query.limit * (query.page_number - 1) },
      { $limit: query.limit },
    ]);
  }

  async searchCategories(
    query: PaginationDto,
  ): Promise<ProductCategoryDocument[]> {
    return this.categoryModel.aggregate([
      {
        $search: {
          index: 'category_index',
          compound: {
            must: [
              {
                text: {
                  query: query.search,
                  path: { wildcard: '*' },
                },
              },
            ],
          },
        },
      },
      { $sort: { title: 1 } },
      { $skip: query.limit * (query.page_number - 1) },
      { $limit: query.limit },
    ]);
  }
}
