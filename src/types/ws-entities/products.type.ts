import { LanguageValue } from '../../xml/xml.interfaces';

export type Product = {
  active: string;
  additional_delivery_times: string;
  additional_shipping_cost: string;
  advanced_stock_management: string;
  associations?: {
    categories?: { id: number }[];
    images?: { id: number }[];
    combinations?: { id: number }[];
    product_option_values?: { id: number }[];
    product_features?: {
      id: string;
      id_feature_value: string;
    }[];
    tags?: { id: number }[];
    stock_availables?: {
      id: string;
      id_product_attribute: string;
    }[];
    attachments?: { id: number }[];
    accessories?: { id: number }[];
    product_bundle?: { id: number }[];
  };
  available_date: string;
  available_for_order: string;
  available_later: string;
  available_now: string;
  cache_default_attribute: string;
  cache_has_attachments: string;
  cache_is_pack: string;
  condition: string;
  customizable: string;
  date_add: string;
  date_upd: string;
  delivery_in_stock: LanguageValue[] | string;
  delivery_out_stock: LanguageValue[] | string;
  depth: string;
  description_short: LanguageValue[] | string;
  description: LanguageValue[] | string;
  ean13: string;
  ecotax: string;
  height: string;
  id_category_default: string;
  id_default_combination: string; //no sync
  id_default_image: string;
  id_manufacturer: string; //no sync
  id_shop_default: string;
  id_supplier: string; //no sync
  id_tax_rules_group: string;
  id_type_redirected: string; //no sync
  id: string;
  indexed: string; //no sync
  is_virtual: string;
  isbn: string;
  link_rewrite: LanguageValue[] | string;
  location: string; //no sync
  low_stock_alert: string; //no sync
  low_stock_threshold: string; //no sync
  manufacturer_name: string; //no sync
  meta_description: LanguageValue[] | string; //no sync
  meta_keywords: LanguageValue[] | string; //no sync
  meta_title: LanguageValue[] | string; //no sync
  minimal_quantity: string; //no sync
  mpn: string;
  name: LanguageValue[] | string;
  new: string; //no sync
  on_sale: string; //no sync
  online_only: string; //no sync
  pack_stock_type: string; //no sync
  position_in_category: string; //no sync
  price: string;
  product_type: string; //no sync
  quantity: string;
  quantity_discount: string; //no sync
  redirect_type: string; //no sync
  reference: string;
  show_condition: string; //no sync
  show_price: string; //no sync
  state: string; //no sync
  supplier_reference: string; //no sync
  text_fields: string; //no sync
  type: string; //no sync
  unit_price_ratio: string;
  unit_price: string; //no sync
  unity: string;
  upc: string;
  uploadable_files: string; //no sync
  visibility: string;
  weight: string;
  wholesale_price: string; //no sync
  width: string;
};

export type ProductWritable = Omit<Product, 'manufacturer_name' | 'quantity'>;
