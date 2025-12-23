// Run this script with: npx ts-node scripts/sync-products-to-meili.ts

import * as dotenv from "dotenv";
dotenv.config();
import "../src/config/database.config";
import { ProductsService } from "../src/modules/products/products.service";
import { indexProductToMeili } from "../src/modules/products/meili.helper";
import { Product } from "../src/database/entities/product.entity";
import { getModelToken } from "@nestjs/mongoose";
import { ProductCatalog, ProductCatalogSchema } from "../src/modules/products/schemas/product-catalog.schema";
import mongoose from "mongoose";
import { AppDataSource } from "../src/database/data-source";

async function main() {
  // Connect to DBs
  const ds = AppDataSource;
  await ds.initialize();
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/bazaary_catalog");

  // Get all products in batches
  const repo = ds.getRepository(Product);
  const listingRepo = ds.getRepository(require('../src/database/entities/seller-listing.entity').SellerListing);
  const sellerRepo = ds.getRepository(require('../src/database/entities/seller.entity').Seller);
  const ProductCatalogModel = mongoose.model(ProductCatalog.name, ProductCatalogSchema, "productcatalogs");
  const batchSize = 100;
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const products = await repo.find({ skip, take: batchSize });
    console.log(`Fetched batch: ${products.length} products (skip: ${skip})`);
    if (products.length === 0) {
      hasMore = false;
      break;
    }
    let indexedCount = 0;
    for (const product of products) {
      const catalog = await ProductCatalogModel.findOne({ productId: product.id }).lean();
      if (!catalog) {
        console.log(`No ProductCatalog found for product ${product.id}`);
      }
      // Find the lowest price ACTIVE listing for this product
      const listing = await listingRepo.findOne({
        where: { productId: product.id, status: 'ACTIVE' },
        order: { price: 'ASC' },
        relations: ['seller'],
      });
      if (!listing) {
        console.log(`No ACTIVE listing found for product ${product.id}`);
      }
      let sellerInfo: any = undefined;
      if (listing && listing.sellerId) {
        const seller = await sellerRepo.findOne({ where: { id: listing.sellerId } });
        if (seller) {
          sellerInfo = {
            id: seller.id,
            businessName: seller.businessName,
            // add more seller fields if needed
          };
        }
      }
      const fullProduct = {
        id: product.id,
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        categoryId: product.categoryId,
        mongoRef: product.mongoRef,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        // Listing fields
        price: listing?.price,
        stockQuantity: listing?.stockQuantity,
        seller: sellerInfo,
        // Flatten catalog fields to top-level for Meilisearch
        description: catalog?.description,
        shortDescription: catalog?.shortDescription,
        images: catalog?.images,
        videos: catalog?.videos,
        specifications: catalog?.specifications,
        variants: catalog?.variants,
        seo: catalog?.seo,
        searchKeywords: catalog?.searchKeywords,
      };
      console.log('Indexing to Meilisearch:', JSON.stringify(fullProduct, null, 2));
      await indexProductToMeili(fullProduct);
      indexedCount++;
      console.log(`Indexed product ${product.id}`);
    }
    console.log(`Indexed ${indexedCount} products in this batch.`);
    skip += batchSize;
  }
  await ds.destroy();
  await mongoose.disconnect();
  console.log("All products synced to Meilisearch!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
