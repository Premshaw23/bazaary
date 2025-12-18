import { Injectable, Logger } from '@nestjs/common';
import { IPaymentGateway, PaymentGatewayResponse, RefundResponse } from '../interfaces/payment-gateway.interface';
import { PaymentMethod } from '../../../database/entities/payment.entity';

@Injectable()
export class MockPaymentGateway implements IPaymentGateway {
  private readonly logger = new Logger(MockPaymentGateway.name);

  async initiatePayment(
    orderId: string,
    amount: number,
    currency: string,
    method: PaymentMethod,
  ): Promise<PaymentGatewayResponse> {
    this.logger.log(`Initiating mock payment for order ${orderId}, amount: ${amount} ${currency}`);

    // Simulate payment processing delay
    await this.delay(1000);


    // Force UPI payments to always succeed for testing
    let success: boolean;
    if (method === PaymentMethod.UPI) {
      success = true;
    } else {
      // Simulate 90% success rate for other methods
      success = Math.random() > 0.1;
    }

    const transactionId = this.generateTransactionId();
    const gatewayOrderId = `MOCK_ORDER_${Date.now()}`;

    if (success) {
      this.logger.log(`Payment successful: ${transactionId}`);
      return {
        success: true,
        transactionId,
        gatewayOrderId,
        message: 'Payment processed successfully',
        gatewayResponse: {
          status: 'captured',
          method,
          amount,
          currency,
          timestamp: new Date().toISOString(),
        },
      };
    } else {
      this.logger.warn(`Payment failed: ${transactionId}`);
      return {
        success: false,
        transactionId,
        message: 'Payment failed due to insufficient funds',
        gatewayResponse: {
          status: 'failed',
          error_code: 'INSUFFICIENT_FUNDS',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentGatewayResponse> {
    this.logger.log(`Verifying payment: ${transactionId}`);

    await this.delay(500);

    // Mock verification - assume transaction exists if it starts with MOCK_TXN_
    const exists = transactionId.startsWith('MOCK_TXN_');

    if (exists) {
      return {
        success: true,
        transactionId,
        message: 'Payment verified',
        gatewayResponse: {
          status: 'captured',
          verified: true,
        },
      };
    } else {
      return {
        success: false,
        transactionId,
        message: 'Transaction not found',
      };
    }
  }

  async initiateRefund(
    transactionId: string,
    amount: number,
  ): Promise<RefundResponse> {
    this.logger.log(`Initiating refund for ${transactionId}, amount: ${amount}`);

    await this.delay(1000);

    const refundId = `MOCK_REFUND_${Date.now()}`;

    // Simulate 95% success rate for refunds
    const success = Math.random() > 0.05;

    if (success) {
      this.logger.log(`Refund successful: ${refundId}`);
      return {
        success: true,
        refundId,
        message: 'Refund processed successfully',
      };
    } else {
      this.logger.warn(`Refund failed: ${refundId}`);
      return {
        success: false,
        refundId,
        message: 'Refund failed - gateway error',
      };
    }
  }

  private generateTransactionId(): string {
    return `MOCK_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}