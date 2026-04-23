import { env } from "../../config/env";
import { CaptureOrderInput, CreateOrderInput, IPaymentGateway } from "./IPaymentGateway";

type PayPalOrderResponse = {
  id: string;
  status: string;
  purchase_units?: Array<{ amount?: { value?: string } }>;
};

export class PayPalService implements IPaymentGateway {
  async createOrder(input: CreateOrderInput): Promise<{ orderId: string; status: string }> {
    const accessToken = await this.getAccessToken();
    const response = await fetch(`${env.paypalBaseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: input.currencyCode,
              value: input.amount.toFixed(2)
            }
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error("Failed to create PayPal order");
    }

    const payload = (await response.json()) as PayPalOrderResponse;
    return { orderId: payload.id, status: payload.status };
  }

  async capturePayment(input: CaptureOrderInput): Promise<{ orderId: string; status: string; amount: number }> {
    const accessToken = await this.getAccessToken();
    const response = await fetch(`${env.paypalBaseUrl}/v2/checkout/orders/${input.orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to capture PayPal order");
    }

    const payload = (await response.json()) as PayPalOrderResponse;
    const rawAmount = payload.purchase_units?.[0]?.amount?.value ?? "0";
    return {
      orderId: payload.id,
      status: payload.status,
      amount: Number(rawAmount)
    };
  }

  private async getAccessToken(): Promise<string> {
    if (!env.paypalClientId || !env.paypalClientSecret) {
      throw new Error("Missing PayPal credentials in environment variables");
    }
    const auth = Buffer.from(`${env.paypalClientId}:${env.paypalClientSecret}`).toString("base64");
    const response = await fetch(`${env.paypalBaseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    if (!response.ok) {
      throw new Error("Failed to authenticate with PayPal");
    }

    const payload = (await response.json()) as { access_token: string };
    return payload.access_token;
  }
}
