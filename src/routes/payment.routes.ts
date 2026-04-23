import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticate } from "../middleware/authenticate";
import { validateRequestBody } from "../middleware/validateRequest";
import { PaymentService } from "../services/payment/PaymentService";
import { PayPalService } from "../services/payment/PayPalService";
import { captureOrderSchema, createOrderSchema } from "../validators/payment.validators";

const paymentService = new PaymentService(new PayPalService());
const paymentController = new PaymentController(paymentService);

export const paymentRouter = Router();

paymentRouter.post("/api/payments/create-order", authenticate, validateRequestBody(createOrderSchema), paymentController.createOrder);
paymentRouter.post("/api/payments/capture-order", authenticate, validateRequestBody(captureOrderSchema), paymentController.captureOrder);
