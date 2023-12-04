import { CategoryWritable } from '../types/ws-entities/categories.type';

export const newCategory: CategoryWritable = {
  id_parent: 3,
  active: 1,
  id_shop_default: '1',
  is_root_category: 0,
  position: 0,
  name: 'Junior',
  link_rewrite: 'junior',
  description:
    "<p>T-shirts, sweaters, hoodies and junior's accessories (5 to 16). </p>",
  meta_title: 'blabla title',
  meta_description: 'blabla description',
  meta_keywords: 'blablaKeyword',
  associations: {
    products: [
      {
        id: 1,
      },
    ],
  },
};
