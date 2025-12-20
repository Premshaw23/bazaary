
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { Product } from '../../database/entities/product.entity';
import { ProductCatalog, ProductCatalogDocument } from './schemas/product-catalog.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectModel(ProductCatalog.name)
    private productCatalogModel: Model<ProductCatalogDocument>,
  ) {}

  async create(createProductDto: CreateProductDto & { sellerId?: string }): Promise<any> {
    try {
      const { sku, name, brand, categoryId, sellerId, ...catalogData } = createProductDto;

      this.logger.log(`Creating product with SKU: ${sku} for seller: ${sellerId}`);

      // Step 1: Create in PostgreSQL
      const product = this.productsRepository.create({
        sku,
        name,
        brand,
        categoryId,
        sellerId,
      });

      const savedProduct = await this.productsRepository.save(product);
      this.logger.log(`Product saved in PostgreSQL: ${savedProduct.id}`);

      // Step 2: Create catalog in MongoDB
      const catalog = new this.productCatalogModel({
        productId: savedProduct.id,
        ...catalogData,
      });

      const savedCatalog = await catalog.save();
      this.logger.log(`Catalog saved in MongoDB: ${savedCatalog._id}`);

      // Step 3: Update PostgreSQL with MongoDB reference
      savedProduct.mongoRef = savedCatalog._id.toString();
      await this.productsRepository.save(savedProduct);

      return this.getFullProduct(savedProduct.id);
    } catch (error) {
      this.logger.error('Error creating product:', error);
      throw error;
    }
  }

  async findAll(filters?: {
    categoryId?: string;
    brand?: string;
    search?: string;
  }): Promise<any[]> {
    try {
      const query = this.productsRepository.createQueryBuilder('product');

      if (filters?.categoryId) {
        query.andWhere('product.category_id = :categoryId', {
          categoryId: filters.categoryId,
        });
      }

      if (filters?.brand) {
        query.andWhere('product.brand = :brand', { brand: filters.brand });
      }

      if (filters?.search) {
        query.andWhere('product.name ILIKE :search', {
          search: `%${filters.search}%`,
        });
      }

      const products = await query.getMany();

      return await Promise.all(
        products.map((product) => this.getFullProduct(product.id)),
      );
    } catch (error) {
      this.logger.error('Error finding products:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<any> {
    return await this.getFullProduct(id);
  }

    async findBySeller(sellerId: string): Promise<any[]> {
    // Validate sellerId is a valid UUID (defensive)
    if (!sellerId || !/^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$/.test(sellerId)) {
      this.logger?.error?.(`findBySeller: Invalid sellerId: ${sellerId}`);
      throw new (require('@nestjs/common').BadRequestException)(`Invalid or missing sellerId: ${sellerId}`);
    }
    // Use query builder to filter by sellerId (if the column exists in DB)
    const products = await this.productsRepository
      .createQueryBuilder('product')
      .where('product.seller_id = :sellerId', { sellerId })
      .getMany();
    return Promise.all(products.map((product) => this.getFullProduct(product.id)));
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<any> {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { sku, name, brand, categoryId, ...catalogData } = updateProductDto;

    if (sku) product.sku = sku;
    if (name) product.name = name;
    if (brand) product.brand = brand;
    if (categoryId) product.categoryId = categoryId;

    await this.productsRepository.save(product);

    if (Object.keys(catalogData).length > 0) {
      await this.productCatalogModel.updateOne(
        { productId: product.id },
        { $set: catalogData },
      );
    }

    return await this.getFullProduct(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productsRepository.softRemove(product);
    await this.productCatalogModel.deleteOne({ productId: id });
  }

  private async getFullProduct(productId: string): Promise<any> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const catalog = await this.productCatalogModel
      .findOne({ productId: product.id })
      .lean()
      .exec();

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      categoryId: product.categoryId,
      mongoRef: product.mongoRef,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      catalog: catalog ? {
        description: catalog.description,
        shortDescription: catalog.shortDescription,
        images: catalog.images,
        videos: catalog.videos,
        specifications: catalog.specifications,
        variants: catalog.variants,
        seo: catalog.seo,
        searchKeywords: catalog.searchKeywords,
      } : null,
    };
  }
}