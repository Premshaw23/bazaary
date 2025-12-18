import { Injectable, BadRequestException } from '@nestjs/common';
import { OrderState } from '../../database/entities/order.entity';

@Injectable()
export class OrderStateMachineService {
  private readonly stateTransitions: Record<OrderState, OrderState[]> = {
  [OrderState.CREATED]: [OrderState.PAYMENT_PENDING, OrderState.PAID, OrderState.CANCELLED],  // ADD PAID here
  [OrderState.PAYMENT_PENDING]: [OrderState.PAID, OrderState.FAILED, OrderState.CANCELLED],
  [OrderState.PAID]: [OrderState.CONFIRMED, OrderState.CANCELLED, OrderState.REFUND_INITIATED],
  [OrderState.CONFIRMED]: [OrderState.PACKED, OrderState.CANCELLED, OrderState.REFUND_INITIATED],
  [OrderState.PACKED]: [OrderState.SHIPPED, OrderState.CANCELLED, OrderState.REFUND_INITIATED],
  [OrderState.SHIPPED]: [OrderState.OUT_FOR_DELIVERY, OrderState.RETURN_REQUESTED],
  [OrderState.OUT_FOR_DELIVERY]: [OrderState.DELIVERED, OrderState.RETURN_REQUESTED],
  [OrderState.DELIVERED]: [OrderState.RETURN_REQUESTED],
  [OrderState.CANCELLED]: [],
  [OrderState.RETURN_REQUESTED]: [OrderState.RETURN_APPROVED, OrderState.DELIVERED],
  [OrderState.RETURN_APPROVED]: [OrderState.RETURNED],
  [OrderState.RETURNED]: [OrderState.REFUND_INITIATED],
  [OrderState.REFUND_INITIATED]: [OrderState.REFUNDED],
  [OrderState.REFUNDED]: [],
  [OrderState.FAILED]: [],
};

  validateTransition(currentState: OrderState, newState: OrderState): void {
    const allowedStates = this.stateTransitions[currentState];
    
    if (!allowedStates.includes(newState)) {
      throw new BadRequestException(
        `Invalid state transition from ${currentState} to ${newState}`,
      );
    }
  }

  canCancel(state: OrderState): boolean {
    return [
      OrderState.CREATED,
      OrderState.PAYMENT_PENDING,
      OrderState.PAID,
      OrderState.CONFIRMED,
      OrderState.PACKED,
    ].includes(state);
  }

  canReturn(state: OrderState): boolean {
    return [
      OrderState.SHIPPED,
      OrderState.OUT_FOR_DELIVERY,
      OrderState.DELIVERED,
    ].includes(state);
  }

  isTerminal(state: OrderState): boolean {
    return [
      OrderState.CANCELLED,
      OrderState.REFUNDED,
      OrderState.FAILED,
    ].includes(state);
  }

  requiresPayment(state: OrderState): boolean {
    return state === OrderState.PAYMENT_PENDING;
  }

  requiresSellerAction(state: OrderState): boolean {
    return [
      OrderState.PAID,
      OrderState.CONFIRMED,
    ].includes(state);
  }
}