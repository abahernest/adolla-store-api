import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AdminDto } from './dto/admin.dto';
import {
  Admin,
  AdminAccountStatus,
  AdminDocument,
} from './entities/admin.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { ObjectIdFromHex } from '../utils/mongo';
import { DefaultSuperUserInfo } from '../utils/constants';

@Injectable()
export class AdminService implements OnModuleInit {
  logger: Logger;

  constructor(
    @InjectModel(Admin.name)
    private adminModel: Model<Admin>,
  ) {
    this.logger = new Logger('AdminService');
  }

  // seed admin collection
  async onModuleInit() {
    try {
      // create super-user
      await this.adminModel.updateOne(
        { email: DefaultSuperUserInfo.email },
        DefaultSuperUserInfo,
        { upsert: true },
      );
    } catch (e) {
      this.logger.error('error seeding admin collection', e);
    }
  }
  create(createAdminDto: AdminDto): Promise<AdminDocument> {
    return this.adminModel.create(createAdminDto);
  }

  findById(
    id: string,
    withPassword: boolean = false,
    session: ClientSession | null = null,
  ): Promise<AdminDocument> {
    return withPassword
      ? this.adminModel
          .findById(id, null, { session })
          .select('+password')
          .exec()
      : this.adminModel.findById(id, null, { session }).exec();
  }

  findByEmail(
    email: string,
    withPassword: boolean = false,
    session: ClientSession | null = null,
  ): Promise<AdminDocument> {
    return withPassword
      ? this.adminModel
          .findOne({ email }, null, { session })
          .select('+password')
          .exec()
      : this.adminModel.findOne({ email }, null, { session }).exec();
  }

  findActiveAdmin(
    id: string,
    withPassword: boolean = false,
    session: ClientSession | null = null,
  ): Promise<AdminDocument> {
    return withPassword
      ? this.adminModel
          .findOne(
            { _id: ObjectIdFromHex(id), status: AdminAccountStatus.ACTIVE },
            null,
            { session },
          )
          .select('+password')
          .exec()
      : this.adminModel
          .findOne(
            { _id: ObjectIdFromHex(id), status: AdminAccountStatus.ACTIVE },
            null,
            { session },
          )
          .exec();
  }
}
