import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { hashPassword } from '../../utils/passwords';

export enum AdminAccountStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

export enum AdminRoleTypes {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
}
@Schema({
  autoIndex: true,
  timestamps: true,
  toObject: { useProjection: true, versionKey: false },
})
export class Admin {
  @Prop({ lowercase: true, trim: true, index: true })
  firstname: string;
  @Prop({ lowercase: true, trim: true, index: true })
  lastname: string;
  @Prop({
    unique: true,
    lowercase: true,
    trim: true,
    isRequired: true,
  })
  email: string;
  @Prop({
    isRequired: true,
    select: false,
    set: (v) => {
      return hashPassword(v);
    },
  })
  password: string;
  @Prop({
    type: String,
    default: AdminAccountStatus.ACTIVE,
    enum: Object.values(AdminAccountStatus),
  })
  status: AdminAccountStatus;
  @Prop()
  @Prop({
    type: String,
    default: AdminRoleTypes.ADMIN,
    enum: Object.values(AdminRoleTypes),
  })
  role: AdminRoleTypes;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

export type AdminDocument = HydratedDocument<Admin>;
