import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  async initiatePayment(
    @Body() initiateDto: InitiatePaymentDto,
    @Headers('idempotency-key') idempotencyKey: string,
    @Request() req,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    return await this.paymentsService.initiatePayment(
      initiateDto.orderId,
      initiateDto.method,
      idempotencyKey,
      req.user.userId,
    );
  }

  @Post('verify')
  async verifyPayment(
    @Body() verifyDto: VerifyPaymentDto,
    @Request() req,
  ) {
    return await this.paymentsService.verifyPayment(
      verifyDto.paymentId,
      verifyDto.transactionId,
      req.user.userId,
    );
  }

  @Post('refund')
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @UseGuards(RolesGuard)
  async refundPayment(@Body() refundDto: RefundPaymentDto) {
    // Validate paymentId
    if (!refundDto.paymentId || refundDto.paymentId === 'null' || refundDto.paymentId === null) {
      throw new BadRequestException('Invalid or missing paymentId for refund');
    }
    return await this.paymentsService.initiateRefund(
      refundDto.paymentId,
      refundDto.amount,
      refundDto.reason,
    );
  }

  @Get(':id')
  async getPayment(@Param('id') id: string, @Request() req) {
    const payment = await this.paymentsService.findOne(id);

    // Authorization check
    if (
      payment.order.buyerId !== req.user.userId &&
      req.user.role !== UserRole.ADMIN
    ) {
      throw new BadRequestException('Unauthorized');
    }

    return payment;
  }

  @Get('order/:orderId')
  async getOrderPayments(@Param('orderId') orderId: string, @Request() req) {
    // TODO: Add authorization check for order ownership
    return await this.paymentsService.findByOrder(orderId);
  }
}