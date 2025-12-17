import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductCatalogDocument = ProductCatalog & Document;

@Schema({ timestamps: true, collection: 'product_catalogs' })
export class ProductCatalog {
  @Prop({ required: true, unique: true })
  productId: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  shortDescription: string;

  @Prop({ type: Array, default: [] })
  images: {
    url: string;
    alt?: string;
    order?: number;
    isPrimary?: boolean;
  }[];

  @Prop({ type: Array, default: [] })
  videos: string[];

  @Prop({ type: Object, default: {} })
  specifications: Record<string, string>;

  @Prop({ type: Array, default: [] })
  variants: {
    name: string;
    values: string[];
  }[];

  @Prop({ type: Object })
  seo: {
    title?: string;
    metaDescription?: string;
    keywords?: string[];
  };

  @Prop({ type: Array, default: [] })
  searchKeywords: string[];
}

export const ProductCatalogSchema = SchemaFactory.createForClass(ProductCatalog);

ProductCatalogSchema.index({ productId: 1 });
ProductCatalogSchema.index({ searchKeywords: 'text' });