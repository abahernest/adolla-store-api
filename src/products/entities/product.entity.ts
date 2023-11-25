import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { IsEnum, IsNumber } from 'class-validator';
import { Currency } from '../../utils/constants';

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

export class Price {
  @Prop({ default: 0 })
  @IsNumber()
  amount: number;
  @Prop({ type: String, enum: Object.values(Currency), default: Currency.NGN })
  @IsEnum(Currency, { message: 'invalid currency' })
  currency: Currency;
}

@Schema({ timestamps: true, autoIndex: true })
export class Product {
  @Prop({ type: mongoose.Schema.Types.ObjectId, index: true, ref: 'Category' })
  category_id: mongoose.ObjectId;
  @Prop({ trim: true, index: true })
  title: string;
  @Prop({ trim: true, index: true })
  description: string;
  @Prop()
  price: Price;
  @Prop()
  quantity: number;
  @Prop({
    default: ProductStatus.ACTIVE,
    enum: Object.values(ProductStatus),
    index: true,
  })
  status: string;
  @Prop()
  deleted_at: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

export type ProductDocument = mongoose.HydratedDocument<Product>;
