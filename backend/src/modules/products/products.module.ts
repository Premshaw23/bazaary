import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '../../database/entities/product.entity';
import { ProductCatalog, ProductCatalogSchema } from './schemas/product-catalog.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, require('../../database/entities/seller-listing.entity').SellerListing]),
    MongooseModule.forFeature([
      { name: ProductCatalog.name, schema: ProductCatalogSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, MongooseModule],
})
export class ProductsModule {}