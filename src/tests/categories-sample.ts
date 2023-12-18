import { CategoryWritable } from '../types/ws-entities/categories.type';
import { getLanguageValues } from '../xml.interfaces';

export const newCategory: CategoryWritable = {
  id_parent: 3,
  active: 1,
  id_shop_default: '1',
  is_root_category: 0,
  position: 0,
  name: 'Junior07',
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

export const categoryMultilanguage: CategoryWritable = {
  id: 4,
  id_parent: 3,
  active: 1,
  id_shop_default: '1',
  is_root_category: 0,
  position: 0,
  name: getLanguageValues(
    { id: 1, value: 'FR-CloudSync' },
    { id: 2, value: 'EN-CloudSync' },
  ),
  link_rewrite: 'CloudSync',
  description: getLanguageValues(
    {
      id: 1,
      value: '<p>FR-CloudSync. </p>',
    },
    {
      id: 2,
      value: '<p>EN-CloudSync. </p>',
    },
  ),
  meta_title: getLanguageValues(
    { id: 1, value: 'FR-CloudSync title' },
    { id: 2, value: 'EN-CloudSync title' },
  ),
  meta_description: getLanguageValues(
    { id: 1, value: 'FR-CloudSync decription' },
    { id: 2, value: 'EN-CloudSync decription' },
  ),
  meta_keywords: getLanguageValues(
    { id: 1, value: 'FR-CloudSync keywords' },
    { id: 2, value: 'EN-CloudSync keywords' },
  ),
  associations: {
    products: [
      {
        id: 1,
      },
    ],
  },
};
