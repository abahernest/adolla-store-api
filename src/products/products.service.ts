import { Injectable } from '@nestjs/common';
import {
  CreateProductDto,
  PaginationDto,
  SortDirection,
  SortIndex,
  UpdateProductDto,
} from './dto/create-product.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  Product,
  ProductDocument,
  ProductStatus,
} from './entities/product.entity';
import { ClientSession, Connection, Model, PipelineStage } from 'mongoose';
import { CurrentTime } from '../utils/date';
import { ObjectIdFromHex } from '../utils/mongo';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectConnection() private connection: Connection,
  ) {}
  async create(
    createProductDto: CreateProductDto,
    session: ClientSession | null = null,
  ): Promise<ProductDocument> {
    const [product] = await this.productModel.create([createProductDto], {
      session,
    });
    return product;
  }

  async findAll(query: PaginationDto): Promise<ProductDocument[]> {
    const filter: object[] = [{ $eq: ['$status', ProductStatus.ACTIVE] }];
    const sortQuery: PipelineStage = { $sort: {} };

    switch (query.sort_index) {
      case SortIndex.createdAt:
        sortQuery.$sort.createdAt =
          query.sort_direction == SortDirection.ASC ? 1 : -1;
        break;
      case SortIndex['price.amount']:
        sortQuery.$sort['price.amount'] =
          query.sort_direction == SortDirection.ASC ? 1 : -1;
        break;
      case SortIndex.title:
        sortQuery.$sort.title =
          query.sort_direction == SortDirection.ASC ? 1 : -1;
        break;
      case SortIndex.quantity:
        sortQuery.$sort.quantity =
          query.sort_direction == SortDirection.ASC ? 1 : -1;
        break;
      default:
        sortQuery.$sort.createdAt = -1;
    }

    if (query.category_id) {
      filter.push({
        $eq: ['$category_id', ObjectIdFromHex(query.category_id)],
      });
    }

    if (query.min_price) {
      filter.push({
        $gte: ['$price.amount', query.min_price],
      });
    }

    if (query.max_price) {
      filter.push({
        $lte: ['$price.amount', query.max_price],
      });
    }

    if (query.currency) {
      filter.push({
        $eq: ['$price.currency', query.currency],
      });
    }

    return this.productModel.aggregate([
      {
        $match: { $expr: { $and: filter } },
      },
      sortQuery,
      { $skip: query.limit * (query.page_number - 1) },
      { $limit: query.limit },
    ]);
  }

  async searchProducts(query: PaginationDto): Promise<ProductDocument[]> {
    const filter = [
      {
        text: {
          query: ProductStatus.ACTIVE,
          path: 'status',
        },
      },
    ];

    return this.productModel.aggregate([
      {
        $search: {
          index: 'product_index',
          compound: {
            must: [
              {
                text: {
                  query: query.search,
                  path: { wildcard: '*' },
                },
              },
            ],
            filter,
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: query.limit * (query.page_number - 1) },
      { $limit: query.limit },
    ]);
  }

  async deleteProduct(
    id: string,
    session: ClientSession | null = null,
  ): Promise<ProductDocument> {
    return this.productModel.findOneAndUpdate(
      { _id: id },
      { status: ProductStatus.DELETED, deleted_at: CurrentTime() },
      { session, new: true },
    );
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    session: ClientSession | null = null,
  ) {
    return this.productModel.findByIdAndUpdate(id, updateProductDto, {
      session,
      new: true,
    });
  }

  async findById(productId: string): Promise<ProductDocument> {
    return this.productModel.findOne({ _id: ObjectIdFromHex(productId) });
  }
}
