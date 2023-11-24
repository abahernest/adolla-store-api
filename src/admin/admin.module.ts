import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './entities/admin.entity';
import { AdminIdExistsConstraint } from './validators/admin-id-exists';
import { AdminEmailNotRegisteredConstraint } from './validators/admin-email-not-registered';
import {
  AdminActivity,
  AdminActivitySchema,
} from './entities/admin-activity.entity';
import { AdminActivityService } from './admin-activity.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: AdminActivity.name, schema: AdminActivitySchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminIdExistsConstraint,
    AdminEmailNotRegisteredConstraint,
    AdminActivityService,
  ],
  exports: [
    AdminService,
    AdminIdExistsConstraint,
    AdminEmailNotRegisteredConstraint,
    AdminActivityService,
  ],
})
export class AdminModule {}
