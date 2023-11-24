import { SchemaOptions, HydratedDocument } from 'mongoose';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { hashPassword } from '../../utils/passwords';

export enum UserAccountStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

const userSchemaOptions: SchemaOptions = {
  autoIndex: true,
  timestamps: true,
  virtuals: {
    fullname: {
      get() {
        return this.firstname + ' ' + this.lastname;
      },
    },
  },
  toObject: { virtuals: true, useProjection: true, versionKey: false },
};

@Schema(userSchemaOptions)
export class User {
  @Prop({ lowercase: true, trim: true, index: true })
  firstname: string;
  @Prop({ lowercase: true, trim: true, index: true })
  lastname: string;
  @Prop({
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;
  @Prop({
    select: false,
    set: (v) => {
      return hashPassword(v);
    },
  })
  password: string;
  @Prop({
    type: String,
    default: UserAccountStatus.ACTIVE,
    enum: Object.values(UserAccountStatus),
  })
  status: UserAccountStatus;
}
export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;
