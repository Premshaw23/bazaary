import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { IPaymentGateway, PaymentGatewayResponse, RefundResponse } from '../interfaces/payment-gateway.interface';
import { PaymentMethod } from '../../../database/entities/payment.entity';

@Injectable()
export class StripeGateway implements IPaymentGateway {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeGateway.name);

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    this.stripe = new Stripe(secretKey || '');

  }

  async initiatePayment(
    orderId: string,
    amount: number,
    currency: string,
    method: PaymentMethod,
  ): Promise<PaymentGatewayResponse> {
    try {
      this.logger.log(`Initiating Stripe payment for order ${orderId}, amount: ${amount}`);
      
      // For Stripe, we usually create a PaymentIntent
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents/paisa
        currency: currency.toLowerCase(),
        metadata: { orderId },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        transactionId: intent.id,
        gatewayOrderId: intent.id, // Using PaymentIntent ID as gateway order ID
        gatewayResponse: intent,
      };
    } catch (error) {
      this.logger.error(`Stripe initiation failed: ${error.message}`);
      return {
        success: false,
        transactionId: '',
        message: error.message,
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentGatewayResponse> {
    try {
      this.logger.log(`Verifying Stripe payment: ${transactionId}`);
      const intent = await this.stripe.paymentIntents.retrieve(transactionId);

      if (intent.status === 'succeeded') {
        return {
          success: true,
          transactionId: intent.id,
          gatewayResponse: intent,
        };
      } else {
        return {
          success: false,
          transactionId: intent.id,
          message: `Stripe payment status: ${intent.status}`,
          gatewayResponse: intent,
        };
      }
    } catch (error) {
      this.logger.error(`Stripe verification failed: ${error.message}`);
      return {
        success: false,
        transactionId,
        message: error.message,
      };
    }
  }

  async initiateRefund(
    transactionId: string,
    amount: number,
  ): Promise<RefundResponse> {
    try {
      this.logger.log(`Initiating Stripe refund for transaction ${transactionId}, amount: ${amount}`);
      const refund = await this.stripe.refunds.create({
        payment_intent: transactionId,
        amount: Math.round(amount * 100),
      });

      return {
        success: true,
        refundId: refund.id,
      };
    } catch (error) {
      this.logger.error(`Stripe refund failed: ${error.message}`);
      return {
        success: false,
        refundId: '',
        message: error.message,
      };
    }
  }
}
