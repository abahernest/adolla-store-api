import { Controller, Post, Body, Request, Patch, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto, NewUserResponse, UserDto } from './dto/user.dto';
import { Public } from '../auth/jwt-auth.guard';
import { ErrorLogger } from '../utils/errors';
import { correctPassword } from '../utils/passwords';

@Controller({ version: '1', path: 'users' })
export class UsersController {
  logger: ErrorLogger;
  constructor(private readonly usersService: UsersService) {
    this.logger = new ErrorLogger('UsersController');
  }

  @Public()
  @Post('signup')
  async signup(@Body() createUserDto: UserDto): Promise<NewUserResponse> {
    try {
      const user = await this.usersService.create(createUserDto);
      return {
        _id: user._id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      };
    } catch (err) {
      this.logger.handleError(
        'an error occurred while creating user account',
        err,
      );
    }
  }

  @Patch('change-password')
  async changePassword(@Body() payload: ChangePasswordDto, @Request() req) {
    try {
      const user = await this.usersService.findById(req.user.id, true);
      const isValidPassword = correctPassword(
        payload.old_password,
        user.password,
      );
      if (!isValidPassword) {
        throw new Error('400:-Bad Request:-wrong password');
      }

      user.password = payload.new_password;
      await user.save();
      return { message: 'success' };
    } catch (e) {
      this.logger.handleError(
        `an error occurred while modifying account password for user ${req.user.id}`,
        e,
      );
    }
  }

  @Get('profile')
  async getUser(@Request() req) {
    try {
      return this.usersService.findById(req.user.id);
    } catch (err) {
      this.logger.handleError(
        `an error occurred while fetching user ${req.user.id}`,
        err,
      );
    }
  }
}
