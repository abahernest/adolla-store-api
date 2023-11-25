import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CategoryService } from '../category.service';

@ValidatorConstraint({ async: true })
export class UniqueCategoryTitleConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly categorySerivce: CategoryService) {}

  validate(title: any) {
    return this.categorySerivce.findByTitle(title).then((category) => {
      return category == undefined;
    });
  }

  defaultMessage(): string {
    return 'product category already exists.';
  }
}

export function UniqueCategoryTitle(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UniqueCategoryTitleConstraint,
    });
  };
}
