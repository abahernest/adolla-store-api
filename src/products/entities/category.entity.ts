import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true, autoIndex: true })
export class ProductCategory {
  @Prop({ trim: true, lowercase: true, unique: true })
  title: string;
  @Prop({ trim: true, lowercase: true, index: true })
  description: string;
}
export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);

export type ProductCategoryDocument =
  mongoose.HydratedDocument<ProductCategory>;
