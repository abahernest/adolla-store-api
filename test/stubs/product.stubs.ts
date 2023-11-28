import { Currency } from '../../src/utils/constants';
import { CreateProductDto } from '../../src/products/dto/create-product.dto';

export const productStubs = (categoryIds: string[]): CreateProductDto[] => {
  const output: CreateProductDto[] = [];
  for (const categoryId of categoryIds) {
    output.push(
      ...[
        {
          category_id: categoryId,
          title: `${categoryId} product 1`,
          description: `${categoryId} description 1`,
          quantity: 120,
          price: {
            amount: 145000,
            currency: Currency.NGN,
          },
          // status: ProductStatus.ACTIVE,
          // deleted_at: null,
        },
        {
          category_id: categoryId,
          title: `${categoryId} product 2`,
          description: `${categoryId} description 2`,
          price: {
            amount: 100000,
            currency: Currency.NGN,
          },
          quantity: 50,
          // status: ProductStatus.ACTIVE,
          // deleted_at: null,
        },
        {
          category_id: categoryId,
          title: `${categoryId} deleted product 3`,
          description: `${categoryId} description 3`,
          price: {
            amount: 100000,
            currency: Currency.NGN,
          },
          quantity: 50,
          // status: ProductStatus.DELETED,
          // deleted_at: new Date(),
        },
      ],
    );
  }

  return output;
};
