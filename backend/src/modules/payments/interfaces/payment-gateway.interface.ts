import { PaymentMethod } from '../../../database/entities/payment.entity';

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId: string;
  gatewayOrderId?: string;
  message?: string;
  gatewayResponse?: any;
}

export interface RefundResponse {
  success: boolean;
  refundId: string;
  message?: string;
}

export interface IPaymentGateway {
  initiatePayment(
    orderId: string,
    amount: number,
    currency: string,
    method: PaymentMethod,
  ): Promise<PaymentGatewayResponse>;

  verifyPayment(transactionId: string): Promise<PaymentGatewayResponse>;

  initiateRefund(
    transactionId: string,
    amount: number,
  ): Promise<RefundResponse>;
}