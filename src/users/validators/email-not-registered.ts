import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersService } from '../users.service';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ async: true })
@Injectable()
export class EmailNotRegisteredConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersService: UsersService) {}

  validate(email: any) {
    return this.usersService.findByEmail(email).then((user) => {
      return user == undefined;
    });
  }

  defaultMessage(): string {
    return 'email already registered';
  }
}

export function EmailNotRegistered(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailNotRegisteredConstraint,
    });
  };
}
