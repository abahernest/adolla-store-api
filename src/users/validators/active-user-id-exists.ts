import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersService } from '../users.service';

@ValidatorConstraint({ async: true })
export class ActiveUserIdExistsConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersService: UsersService) {}

  validate(userId: string) {
    return this.usersService.findActiveUser(userId).then((user) => {
      return user != undefined;
    });
  }

  defaultMessage(): string {
    return 'user with this id does not exist';
  }
}

export function ActiveUserIdExists(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ActiveUserIdExistsConstraint,
    });
  };
}
