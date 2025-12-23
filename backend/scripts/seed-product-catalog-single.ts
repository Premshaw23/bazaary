// Run this script with: npx ts-node scripts/seed-product-catalog-single.ts

import * as dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { ProductCatalog, ProductCatalogSchema } from "../src/modules/products/schemas/product-catalog.schema";

async function main() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/bazaary_catalog");
  const ProductCatalogModel = mongoose.model(ProductCatalog.name, ProductCatalogSchema, "productcatalogs");

  // Seed ProductCatalog for a single product
  const doc = {
    productId: "059e1f5c-0517-47b4-b970-670d892076b5",
    description: "Delicious chocolate cake from Mio Amore.",
    shortDescription: "Rich chocolate cake.",
    images: ["https://example.com/chocolate-cake.jpg"],
    videos: [],
    specifications: { flavor: "chocolate", weight: "500g" },
    variants: [],
    seo: { title: "Chocolate Cake", keywords: ["cake", "chocolate", "mioamore"] },
    searchKeywords: ["cake", "chocolate", "mioamore"]
  };

  await ProductCatalogModel.updateOne(
    { productId: doc.productId },
    { $set: doc },
    { upsert: true }
  );
  console.log(`Seeded ProductCatalog for product ${doc.productId}`);

  await mongoose.disconnect();
  console.log("Done seeding ProductCatalog!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
