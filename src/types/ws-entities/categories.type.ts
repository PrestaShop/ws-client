//Readable

import { LanguageValue } from '../../xml/xml.interfaces';

export type Category = {
  active: number;
  additional_description?: LanguageValue[] | string;
  associations?: {
    categories?: { id: number }[];
    products?: { id: number }[];
  };
  date_add?: string;
  date_upd?: string;
  description?: LanguageValue[] | string;
  id_parent?: number;
  id_shop_default?: string;
  id?: number;
  is_root_category?: number;
  level_depth?: string;
  link_rewrite: LanguageValue[] | string;
  meta_description?: LanguageValue[] | string;
  meta_keywords?: LanguageValue[] | string;
  meta_title?: LanguageValue[] | string;
  name: LanguageValue[] | string;
  nb_products_recursive?: string;
  position?: number;
};

//Writable
export type CategoryWritable = Omit<
  Category,
  'level_depth' | 'nb_products_recursive'
>;
