export interface PaymentTransaction {
    id: number;
    orderId: number;
    paymentGateway: string;
    gatewayTxnRef: string;
    amount: number;
    txnStatus: string;
    txnMessage: string;
    txnTime: Date;
    rawResponseData: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface IListPaymentTransactionQuery {
    page?: number
    size?: number
    key?: string
    orderId?: number;
}