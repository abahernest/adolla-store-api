import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AdminService } from '../admin.service';

@ValidatorConstraint({ async: true })
export class AdminEmailNotRegisteredConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly adminService: AdminService) {}

  validate(email: any) {
    return this.adminService.findByEmail(email).then((admin) => {
      return admin == undefined;
    });
  }

  defaultMessage(): string {
    return 'email already registered';
  }
}

export function AdminEmailNotRegistered(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: AdminEmailNotRegisteredConstraint,
    });
  };
}
