import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller, SellerLifecycle } from '../../database/entities/seller.entity';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { VerifySellerDto } from './dto/verify-seller.dto';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Seller)
    private sellersRepository: Repository<Seller>,
  ) {}

  async create(userId: string, createSellerDto: CreateSellerDto): Promise<Seller> {
    // Check if user already has a seller account
    const existing = await this.sellersRepository.findOne({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException('Seller account already exists for this user');
    }

    const seller = this.sellersRepository.create({
      userId,
      ...createSellerDto,
      lifecycleState: SellerLifecycle.APPLIED,
    });

    return await this.sellersRepository.save(seller);
  }

  async findAll(filters?: {
    lifecycleState?: SellerLifecycle;
    featured?: boolean;
    verifiedBadge?: boolean;
  }): Promise<Seller[]> {
    const query = this.sellersRepository.createQueryBuilder('seller');

    if (filters?.lifecycleState) {
      query.andWhere('seller.lifecycle_state = :state', {
        state: filters.lifecycleState,
      });
    }

    if (filters?.featured !== undefined) {
      query.andWhere('seller.featured = :featured', {
        featured: filters.featured,
      });
    }

    if (filters?.verifiedBadge !== undefined) {
      query.andWhere('seller.verified_badge = :badge', {
        badge: filters.verifiedBadge,
      });
    }

    query.orderBy('seller.rating', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Seller> {
    const seller = await this.sellersRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return seller;
  }

  async findByUserId(userId: string): Promise<Seller | null> {
    return await this.sellersRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async update(id: string, updateSellerDto: UpdateSellerDto): Promise<Seller> {
    const seller = await this.findOne(id);

    // Prevent updating certain fields if not in correct state
    if (seller.lifecycleState === SellerLifecycle.BANNED) {
      throw new ForbiddenException('Cannot update banned seller account');
    }

    Object.assign(seller, updateSellerDto);

    return await this.sellersRepository.save(seller);
  }

  async updateLifecycleState(
    id: string,
    verifyDto: VerifySellerDto,
    adminUserId: string,
  ): Promise<Seller> {
    const seller = await this.findOne(id);

    const { lifecycleState } = verifyDto;

    // Validate state transitions
    this.validateStateTransition(seller.lifecycleState, lifecycleState);

    seller.lifecycleState = lifecycleState;

    if (lifecycleState === SellerLifecycle.VERIFIED || lifecycleState === SellerLifecycle.ACTIVE) {
      seller.verifiedAt = new Date();
      seller.verifiedBy = adminUserId;
      seller.verifiedBadge = true;
    }

    return await this.sellersRepository.save(seller);
  }

  async updateMetrics(sellerId: string, metrics: {
    totalOrders?: number;
    fulfilledOrders?: number;
    returnRate?: number;
    averageFulfillmentTime?: number;
  }): Promise<Seller> {
    const seller = await this.findOne(sellerId);

    if (metrics.totalOrders !== undefined) {
      seller.totalOrders = metrics.totalOrders;
    }

    if (metrics.fulfilledOrders !== undefined) {
      seller.fulfilledOrders = metrics.fulfilledOrders;
    }

    if (metrics.returnRate !== undefined) {
      seller.returnRate = metrics.returnRate;
    }

    if (metrics.averageFulfillmentTime !== undefined) {
      seller.averageFulfillmentTime = metrics.averageFulfillmentTime;
    }

    // Calculate reliability score (0-100)
    seller.reliabilityScore = this.calculateReliabilityScore(seller);

    return await this.sellersRepository.save(seller);
  }

  private validateStateTransition(
    currentState: SellerLifecycle,
    newState: SellerLifecycle,
  ): void {
    const validTransitions: Record<SellerLifecycle, SellerLifecycle[]> = {
      [SellerLifecycle.APPLIED]: [
        SellerLifecycle.UNDER_REVIEW,
        SellerLifecycle.BANNED,
      ],
      [SellerLifecycle.UNDER_REVIEW]: [
        SellerLifecycle.VERIFIED,
        SellerLifecycle.APPLIED,
        SellerLifecycle.BANNED,
      ],
      [SellerLifecycle.VERIFIED]: [
        SellerLifecycle.ACTIVE,
        SellerLifecycle.SUSPENDED,
      ],
      [SellerLifecycle.ACTIVE]: [
        SellerLifecycle.SUSPENDED,
        SellerLifecycle.BANNED,
      ],
      [SellerLifecycle.SUSPENDED]: [
        SellerLifecycle.ACTIVE,
        SellerLifecycle.BANNED,
      ],
      [SellerLifecycle.BANNED]: [], // Terminal state
    };

    if (!validTransitions[currentState].includes(newState)) {
      throw new BadRequestException(
        `Invalid state transition from ${currentState} to ${newState}`,
      );
    }
  }

  private calculateReliabilityScore(seller: Seller): number {
    let score = 100;

    // Fulfillment rate (40 points)
    if (seller.totalOrders > 0) {
      const fulfillmentRate = seller.fulfilledOrders / seller.totalOrders;
      score -= (1 - fulfillmentRate) * 40;
    }

    // Return rate (30 points)
    score -= seller.returnRate * 30;

    // Rating (20 points)
    score -= (5 - seller.rating) * 4;

    // Fulfillment speed (10 points)
    if (seller.averageFulfillmentTime) {
      const expectedTime = 24; // hours
      if (seller.averageFulfillmentTime > expectedTime) {
        const penalty = Math.min(
          ((seller.averageFulfillmentTime - expectedTime) / expectedTime) * 10,
          10,
        );
        score -= penalty;
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  async getMetrics(sellerId: string) {
    const seller = await this.findOne(sellerId);

    return {
      totalOrders: seller.totalOrders,
      fulfilledOrders: seller.fulfilledOrders,
      fulfillmentRate: seller.totalOrders > 0
        ? (seller.fulfilledOrders / seller.totalOrders) * 100
        : 0,
      returnRate: seller.returnRate,
      rating: seller.rating,
      averageFulfillmentTime: seller.averageFulfillmentTime,
      reliabilityScore: seller.reliabilityScore,
      lifecycleState: seller.lifecycleState,
      verifiedBadge: seller.verifiedBadge,
    };
  }

  async remove(id: string): Promise<void> {
    const seller = await this.findOne(id);
    await this.sellersRepository.remove(seller);
  }
}