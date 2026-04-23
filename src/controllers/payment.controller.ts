import { Request, Response } from "express";
import { PaymentService } from "../services/payment/PaymentService";
import { CaptureOrderBody, CreateOrderBody } from "../validators/payment.validators";

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  createOrder = async (request: Request<unknown, unknown, CreateOrderBody>, response: Response): Promise<void> => {
    try {
      const userId = request.authenticatedUser?.userId;
      if (!userId) {
        response.status(401).json({ message: "Unauthorized" });
        return;
      }
      const order = await this.paymentService.createOrder(userId, request.body.amount, request.body.currencyCode);
      response.status(201).json(order);
    } catch (error) {
      response.status(400).json({ message: (error as Error).message });
    }
  };

  captureOrder = async (request: Request<unknown, unknown, CaptureOrderBody>, response: Response): Promise<void> => {
    try {
      const userId = request.authenticatedUser?.userId;
      if (!userId) {
        response.status(401).json({ message: "Unauthorized" });
        return;
      }
      const capture = await this.paymentService.captureOrder(userId, request.body.orderId);
      response.status(200).json(capture);
    } catch (error) {
      response.status(400).json({ message: (error as Error).message });
    }
  };
}
