import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CategoryService } from '../category.service';

@ValidatorConstraint({ async: true })
export class CategoryIdExistsConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly categoryService: CategoryService) {}

  validate(id: any) {
    return id
      ? this.categoryService.findById(id).then((category) => {
          return category != undefined;
        })
      : false;
  }

  defaultMessage(): string {
    return 'category with this id does not exist';
  }
}

export function CategoryIdExists(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CategoryIdExistsConstraint,
    });
  };
}
