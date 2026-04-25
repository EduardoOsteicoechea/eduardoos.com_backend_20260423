import { articlesDb } from "../../db";
import { transactions } from "../../db/articles-schema";
import { IPaymentGateway } from "./IPaymentGateway";

export class PaymentService {
  constructor(private readonly paymentGateway: IPaymentGateway) {}

  async createOrder(userId: string, amount: number, currencyCode: string) {
    const order = await this.paymentGateway.createOrder({ amount, currencyCode });

    articlesDb.insert(transactions).values({
      userId,
      orderId: order.orderId,
      provider: "paypal",
      status: order.status,
      amount
    }).run();

    return order;
  }

  async captureOrder(userId: string, orderId: string) {
    const capture = await this.paymentGateway.capturePayment({ orderId });

    articlesDb.insert(transactions).values({
      userId,
      orderId: capture.orderId,
      provider: "paypal",
      status: capture.status,
      amount: capture.amount
    }).run();

    return capture;
  }
}
