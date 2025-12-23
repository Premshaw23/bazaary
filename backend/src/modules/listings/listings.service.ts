
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { SellerListing, ListingStatus } from '../../database/entities/seller-listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ProductCatalog, ProductCatalogDocument } from '../products/schemas/product-catalog.schema';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(SellerListing)
    private listingsRepository: Repository<SellerListing>,
    @InjectModel(ProductCatalog.name)
    private productCatalogModel: Model<ProductCatalogDocument>,
  ) {}

  async create(sellerId: string, createListingDto: CreateListingDto): Promise<SellerListing> {
    const existing = await this.listingsRepository.findOne({
      where: {
        productId: createListingDto.productId,
        sellerId,
      },
    });

    if (existing) {
      throw new BadRequestException('You already have a listing for this product');
    }

    const listing = this.listingsRepository.create({
      ...createListingDto,
      sellerId,
      status: ListingStatus.DRAFT,
    });

    return await this.listingsRepository.save(listing);
  }

  async findAll(filters?: {
    sellerId?: string;
    productId?: string;
    status?: ListingStatus;
  }): Promise<any[]> {
    const query = this.listingsRepository.createQueryBuilder('listing')
      .leftJoinAndSelect('listing.product', 'product')
      .leftJoinAndSelect('listing.seller', 'seller')
      .andWhere('product.deleted_at IS NULL');

    if (filters?.sellerId) {
      query.andWhere('listing.seller_id = :sellerId', {
        sellerId: filters.sellerId,
      });
    }

    if (filters?.productId) {
      query.andWhere('listing.product_id = :productId', {
        productId: filters.productId,
      });
    }

    if (filters?.status) {
      query.andWhere('listing.status = :status', {
        status: filters.status,
      });
    }

    query.orderBy('listing.price', 'ASC');

    const listings = await query.getMany();

    // Attach product catalog info to each listing
    return await Promise.all(
      listings.map(async (listing) => {
        let catalog: any = null;
        if (listing.product && listing.product.id) {
          catalog = await this.productCatalogModel.findOne({ productId: listing.product.id }).lean().exec();
        }
        return {
          ...listing,
          product: {
            ...listing.product,
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
          },
        };
      })
    );
  }

  async findOne(id: string): Promise<SellerListing> {
    const listing = await this.listingsRepository.findOne({
      where: { id },
      relations: ['product', 'seller'],
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  async update(id: string, updateListingDto: UpdateListingDto): Promise<SellerListing> {
    const listing = await this.findOne(id);

    Object.assign(listing, updateListingDto);

    // Auto-update status based on stock
    if (listing.stockQuantity === 0) {
      listing.status = ListingStatus.OUT_OF_STOCK;
    } else if (listing.status === ListingStatus.OUT_OF_STOCK && listing.stockQuantity > 0) {
      listing.status = ListingStatus.ACTIVE;
    }

    return await this.listingsRepository.save(listing);
  }

  async updateStatus(id: string, status: ListingStatus): Promise<SellerListing> {
    const listing = await this.findOne(id);

    if (status === ListingStatus.ACTIVE && listing.stockQuantity === 0) {
      throw new BadRequestException('Cannot activate listing with zero stock');
    }

    listing.status = status;

    return await this.listingsRepository.save(listing);
  }

  async remove(id: string): Promise<void> {
    const listing = await this.findOne(id);
    await this.listingsRepository.remove(listing);
  }

  async getAvailableStock(listingId: string): Promise<number> {
    const listing = await this.findOne(listingId);
    return listing.stockQuantity - listing.reservedQuantity;
  }
}