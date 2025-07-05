import { ConsumerDeliveriesResponse } from "../types/ExternalApiTypes.js";

export class ConsumerDeliveriesAPI {
    static async requestDelivery(orderId: number, units: number): Promise<ConsumerDeliveriesResponse> {
        try {
            const response = await fetch('https://consumerdeliveries/api/delivery-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    units,
                    destination: 'consumer',
                }),
            });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const result: ConsumerDeliveriesResponse = await response.json();
            return result;
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}

export class CommercialBankAPI {
    static async makePayment(deliverReference: number, amount: number, who: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch('https://commercialbank/api/make-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deliver_reference: deliverReference,
                    amount,
                    who
                }),
            });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const result = await response.json();
            return result;
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}
