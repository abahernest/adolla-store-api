import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ProductsService } from '../products.service';

@ValidatorConstraint({ async: true })
export class ProductIdExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly productsService: ProductsService) {}

  validate(id: any) {
    return id
      ? this.productsService.findById(id).then((product) => {
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
