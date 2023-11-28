import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ObjectIdFromHex } from '../../utils/mongo';

@ValidatorConstraint({ async: true })
@Injectable()
export class ProductIdExistsConstraint implements ValidatorConstraintInterface {
  constructor(@InjectConnection() private connection: Connection) {}

  validate(id: any) {
    return id
      ? this.connection
          .collection('products')
          .findOne({ _id: ObjectIdFromHex(id) })
          .then((product) => {
            return product != undefined;
          })
      : false;
  }

  defaultMessage(): string {
    return 'product with this id does not exist';
  }
}

export function ProductIdExists(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ProductIdExistsConstraint,
    });
  };
}
