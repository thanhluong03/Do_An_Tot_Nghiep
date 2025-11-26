import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentTransactionRepository } from '@app/database';
import { PaymentTransaction, IListPaymentTransactionQuery } from './paymenttransaction.interface';

interface MoMoPaymentResponse {
    partnerCode: string;
    orderId: string;
    requestId: string;
    amount: number;
    responseTime: number;
    message: string;
    resultCode: number;
    payUrl: string;
    deeplink?: string;
    qrCodeUrl?: string;
}

@Injectable()
export class PaymenttransactionService {
    constructor(
        private readonly configService: ConfigService,
        @Inject(PaymentTransactionRepository)
        private readonly paymentTransactionRepo: PaymentTransactionRepository,
    ) { }

    async getListTransactions(query: IListPaymentTransactionQuery) {
        const page = query.page ?? 1;
        const size = query.size ?? 10;
        const offset = (page - 1) * size;
        const data = await this.paymentTransactionRepo.findAll({
            limit: size,
            offset,
        });
        return {
            data: data.map((item) => this.mapEntityToInterface(item)),
            total: data.length,
            page,
            size,
        };
    }

    async createMomoPayment(params: { orderId: number; amount: number }): Promise<MoMoPaymentResponse> {
        const partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE') || 'MOMO';
        const accessKey = this.configService.get<string>('MOMO_ACCESS_KEY') || 'F8BBA842ECF85';
        const secretKey = this.configService.get<string>('MOMO_SECRET_KEY') || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        const requestId = partnerCode + new Date().getTime();
        const orderId = requestId;
        const orderInfo = `Thanh toan don hang #${params.orderId}`;
        const redirectUrl = this.configService.get<string>('MOMO_RETURN_URL') || 'https://momo.vn/return';
        const ipnUrl = this.configService.get<string>('MOMO_IPN_URL') || 'https://callback.url/notify';
        const amount = params.amount.toString();
        const requestType = 'captureWallet';
        const extraData = '';

        // Create raw signature
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        // Generate signature
        const signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        const requestBody = {
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: 'en'
        };

        return new Promise<MoMoPaymentResponse>((resolve, reject) => {
            const https = require('https');
            const postData = JSON.stringify(requestBody);

            const options = {
                hostname: 'test-payment.momo.vn',
                port: 443,
                path: '/v2/gateway/api/create',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const response: MoMoPaymentResponse = JSON.parse(data);

                        if (response.resultCode === 0) {
                            resolve(response);
                        } else {
                            console.error('[MOMO] ❌ MoMo API error:', response.message);
                            reject(new Error(`MoMo API Error: ${response.message} (Code: ${response.resultCode})`));
                        }
                    } catch (error) {
                        console.error('[MOMO] ❌ JSON Parse error:', error);
                        console.error('[MOMO] Raw data:', data);
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                console.error('[MOMO] ❌ Request error:', error);
                reject(error);
            });

            req.write(postData);
            req.end();
        });
    }

    verifyMomoSignature(data: any): boolean {
        const secretKey = this.configService.get<string>('MOMO_SECRET_KEY') || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';

        const rawSignature = `accessKey=${data.accessKey}&amount=${data.amount}&extraData=${data.extraData}&message=${data.message}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&orderType=${data.orderType}&partnerCode=${data.partnerCode}&payType=${data.payType}&requestId=${data.requestId}&responseTime=${data.responseTime}&resultCode=${data.resultCode}&transId=${data.transId}`;

        const signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        return signature === data.signature;
    }

    private mapEntityToInterface(entity: any): PaymentTransaction {
        return {
            id: entity.id,
            orderId: entity.orderId,
            paymentGateway: entity.paymentGateway,
            gatewayTxnRef: entity.gatewayTxnRef,
            amount: entity.amount,
            txnStatus: entity.txnStatus,
            txnMessage: entity.txnMessage,
            txnTime: entity.txnTime,
            rawResponseData: entity.rawResponseData,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
