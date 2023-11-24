import { Injectable } from '@nestjs/common';
import { UserDto, UpdateUserFilterDto } from './dto/user.dto';
import { User, UserAccountStatus, UserDocument } from './entities/user.entity';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectConnection() private connection: Connection,
  ) {}

  async create(createUserDto: UserDto): Promise<UserDocument> {
    return await this.userModel.create(createUserDto);
  }

  async findById(
    id: string,
    withPassword = false,
    session: ClientSession | null = null,
  ): Promise<UserDocument> {
    return withPassword
      ? await this.userModel.findById(id).select('+password').exec()
      : await this.userModel.findById(id, null, { session }).exec();
  }

  async findByEmail(
    email: string,
    withPassword = false,
    session: ClientSession | null = null,
  ): Promise<UserDocument> {
    return withPassword
      ? await this.userModel
          .findOne({ email }, null, { session })
          .select('+password')
          .exec()
      : await this.userModel.findOne({ email }, null, { session }).exec();
  }

  async updatePassword(
    filter: UpdateUserFilterDto,
    password: string,
    session: ClientSession | null = null,
  ): Promise<UserDocument> {
    return await this.userModel.findOneAndUpdate(
      filter,
      { password },
      { session, new: true },
    );
  }

  async findActiveUser(userId): Promise<UserDocument> {
    return await this.userModel.findOne({
      _id: userId,
      status: UserAccountStatus.ACTIVE,
    });
  }
}
