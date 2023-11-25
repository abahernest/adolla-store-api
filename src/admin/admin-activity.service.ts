import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AdminActivity } from './entities/admin-activity.entity';
import { ClientSession, HydratedDocument, Model } from 'mongoose';
import { PaginationDto } from './dto/admin-activity.dto';
import { CreateAdminActivityDto } from './dto/admin-activity.dto';
import { ObjectIdFromHex } from '../utils/mongo';

@Injectable()
export class AdminActivityService {
  constructor(
    @InjectModel(AdminActivity.name)
    private adminActivityModel: Model<AdminActivity>,
  ) {}

  async create(
    createAdminActivityDto: CreateAdminActivityDto,
    session: ClientSession | null = null,
  ): Promise<HydratedDocument<AdminActivity, object, object>> {
    const [activity] = await this.adminActivityModel.create(
      [createAdminActivityDto],
      {
        session,
      },
    );
    return activity;
  }

  async countAdminActivities(adminId: string): Promise<number> {
    return this.adminActivityModel.countDocuments({ admin_id: adminId });
  }

  async getAdminActivities(
    adminId: string,
    query: PaginationDto,
  ): Promise<any> {
    return this.adminActivityModel.aggregate([
      {
        $match: { admin_id: ObjectIdFromHex(adminId) },
      },
      {
        $sort: { createdAt: -1 },
      },
      { $skip: query.limit * (query.page_number - 1) },
      { $limit: query.limit },
    ]);
  }
}
