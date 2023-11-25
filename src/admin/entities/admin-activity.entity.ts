import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { IsOptional } from 'class-validator';

export enum AdminActivityType {
  ADD_ADMIN = 'ADD_ADMIN',
  ADD_PRODUCT = 'ADD_PRODUCT',
  EDIT_PRODUCT = 'EDIT_PRODUCT',
  DELETE_PRODUCT = 'DELETE_PRODUCT',
  ADD_CATEGORY = 'ADD_CATEGORY',
}

export class ActivityExtraDetails {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  @IsOptional()
  product_id?: mongoose.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' })
  @IsOptional()
  category_id?: mongoose.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  @IsOptional()
  admin_id?: mongoose.ObjectId;
  @Prop({ type: Object, default: {} })
  more?: object;
}

@Schema({
  autoIndex: true,
  timestamps: true,
  toObject: { useProjection: true, versionKey: false },
})
export class AdminActivity {
  @Prop({ lowercase: true, trim: true, index: true })
  comment: string;
  @Prop({
    type: String,
    default: AdminActivityType.ADD_ADMIN,
    enum: Object.values(AdminActivityType),
    index: true,
  })
  type: AdminActivityType;
  @Prop()
  extra_details: ActivityExtraDetails;
  @Prop({ type: mongoose.Schema.Types.ObjectId, index: true })
  admin_id: mongoose.ObjectId;
}

export const AdminActivitySchema = SchemaFactory.createForClass(AdminActivity);

export type AdminActivityDocument = HydratedDocument<AdminActivity>;
