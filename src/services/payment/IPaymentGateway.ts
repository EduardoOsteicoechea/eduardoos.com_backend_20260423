export type CreateOrderInput = {
  amount: number;
  currencyCode: string;
};

export type CaptureOrderInput = {
  orderId: string;
};

export interface IPaymentGateway {
  createOrder(input: CreateOrderInput): Promise<{ orderId: string; status: string }>;
  capturePayment(input: CaptureOrderInput): Promise<{ orderId: string; status: string; amount: number }>;
}
