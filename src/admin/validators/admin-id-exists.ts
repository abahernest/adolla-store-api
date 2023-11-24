import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AdminService } from '../admin.service';

@ValidatorConstraint({ async: true })
export class AdminIdExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly adminService: AdminService) {}

  validate(id: string) {
    return this.adminService.findById(id).then((admin) => {
      return admin != undefined;
    });
  }

  defaultMessage(): string {
    return 'admin with this id does not exist';
  }
}

export function AdminIdExists(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: AdminIdExistsConstraint,
    });
  };
}
