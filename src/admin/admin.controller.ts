import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminDto, AdminIdDto } from './dto/admin.dto';
import { ErrorLogger } from '../utils/errors';
import { PaginatedResponseDto, PaginationDto } from './dto/admin-activity.dto';
import { AdminAuthGuard } from '../auth/jwt-auth.guard';
import { AdminActivityService } from './admin-activity.service';
import { AdminActivityType } from './entities/admin-activity.entity';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@AdminAuthGuard()
@Controller({ version: '1', path: 'admin' })
export class AdminController {
  logger: ErrorLogger;
  constructor(
    private readonly adminService: AdminService,
    private readonly activityService: AdminActivityService,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.logger = new ErrorLogger('AdminController');
  }

  @Post()
  async create(
    @Body() createAdminDto: AdminDto,
    @Request() req,
  ): Promise<AdminDto> {
    try {
      // create mongo session for db transaction;
      const session = await this.connection.startSession();

      // operation to be performed
      async function _create() {
        const admin = await this.adminService.create(createAdminDto, session);
        if (!admin) {
          throw new Error(`400:-Bad Request:-could not create admin user`);
        }

        // activity trail
        const activity = await this.activityService.create(
          {
            type: AdminActivityType.ADD_ADMIN,
            comment: `Created admin user with email: ${createAdminDto.email}.`,
            admin_id: req.user.id,
            extra_details: { more: createAdminDto },
          },
          session,
        );
        if (!activity) {
          throw new Error(
            `500:-Internal Server Error:-could not record ${AdminActivityType.ADD_ADMIN} activity for admin ${req.user.id}`,
          );
        }
      }

      // bind db transaction operation
      const boundedTxFunction = _create.bind(this);
      // pass bounded method to mongo Tr
      await session.withTransaction(boundedTxFunction);
      await session.endSession();

      delete createAdminDto.password;
      return createAdminDto;
    } catch (e) {
      this.logger.handleError(`an error occurred while creating admin user`, e);
    }
  }

  @Get(':admin_id/activity-trail')
  async getAdminActivities(
    @Param() adminIdDto: AdminIdDto,
    @Query('page_number') page_number: string = '1',
    @Query('limit') limit: string = '100',
  ) {
    try {
      const paginationDto: PaginationDto = {
        limit: parseInt(limit),
        page_number: parseInt(page_number),
      };

      const total = await this.activityService.countAdminActivities(
        adminIdDto.admin_id,
      );

      const data = await this.activityService.getAdminActivities(
        adminIdDto.admin_id,
        paginationDto,
      );

      const output: PaginatedResponseDto = {
        meta: {
          limit: paginationDto.limit,
          page_number: paginationDto.page_number,
          total,
        },
        data,
      };
      return output;
    } catch (e) {
      this.logger.handleError(
        `an error occurred while fetching activity trail for admin user ${adminIdDto.admin_id}`,
        e,
      );
    }
  }
}
