import {
  ActivityExtraDetails,
  AdminActivityType,
} from '../entities/admin-activity.entity';
import mongoose from 'mongoose';

export class CreateAdminActivityDto {
  comment!: string;
  extra_details!: ActivityExtraDetails;
  admin_id!: mongoose.ObjectId;
  type!: AdminActivityType;
}

export class PaginationDto {
  page_number?: number = 1;
  limit?: number = 10;
  sort?: 1 | -1 = -1;
  search?: string = '';
}

export class PaginatedResponseDto {
  meta: {
    page_number?: number;
    limit?: number;
    total?: number;
  };
  data: any;
}
