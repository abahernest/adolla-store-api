import { ProductCategory } from '../../src/products/entities/category.entity';

export const categoryStubs = (): ProductCategory[] => {
  return [
    {
      title: `Electronics`,
      description: `all electronic gadgets`,
    },
    {
      title: `Fashion`,
      description: `all fashion wears`,
    },
  ];
};
