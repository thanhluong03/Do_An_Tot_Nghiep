import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as qs from 'querystring';
import { PaymentTransactionRepository } from '@app/database';
import { PaymentTransaction, IListPaymentTransactionQuery } from './paymenttransaction.interface';

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

    buildVnpayUrl(
        params: { orderId: number; amount: number; bankCode?: string },
        clientIp: string,
    ): string {
        console.log('[VNPAY][buildVnpayUrl] input params:', params);
        console.log('[VNPAY][buildVnpayUrl] clientIp:', clientIp);
        const tmnCode = (
            this.configService.get<string>('VNPAY_TMN_CODE') || ''
        ).trim();
        const secretKey = (
            this.configService.get<string>('VNPAY_HASH_SECRET') || ''
        ).trim();
        const vnpUrl = (
            this.configService.get<string>('VNPAY_PAYMENT_URL') || ''
        ).trim();
        const returnUrl = (
            this.configService.get<string>('VNPAY_RETURN_URL') || ''
        ).trim();
        console.log('[VNPAY][buildVnpayUrl] config:', { tmnCode, secretKey, vnpUrl, returnUrl });
        const date = new Date();
        const vnp_TxnRef = date.getTime().toString();
        const vnp_OrderInfo = `Thanh toan don hang #${params.orderId}`;
        const vnp_Amount = (params.amount * 100).toString();
        const vnp_IpAddr = clientIp || '127.0.0.1';
        const vnp_BankCode = params.bankCode ? String(params.bankCode) : undefined;
        const vnp_CreateDate = date
            .toISOString()
            .replace(/[-T:.Z]/g, '')
            .slice(0, 14);

        let vnp_Params: Record<string, string> = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: vnp_TxnRef,
            vnp_OrderInfo: vnp_OrderInfo,
            vnp_OrderType: 'other',
            vnp_Amount: vnp_Amount,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: vnp_IpAddr,
            vnp_CreateDate: vnp_CreateDate,
        };
        if (vnp_BankCode) vnp_Params['vnp_BankCode'] = vnp_BankCode;
        Object.keys(vnp_Params).forEach((key) => {
            if (
                vnp_Params[key] === undefined ||
                vnp_Params[key] === null ||
                vnp_Params[key] === ''
            ) {
                delete vnp_Params[key];
            }
        });
        const sortedKeys = Object.keys(vnp_Params).sort();
        const sortedParams: Record<string, string> = {};
        sortedKeys.forEach((key) => {
            sortedParams[key] = vnp_Params[key];
        });
        const signData = sortedKeys
            .map((key) => key + '=' + encodeURIComponent(sortedParams[key]))
            .join('&');
        const hmac = crypto.createHmac('sha512', secretKey);
        const vnp_SecureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        sortedParams['vnp_SecureHash'] = vnp_SecureHash;
        const url = `${vnpUrl}?${qs.stringify(sortedParams)}`;
        console.log('[VNPAY][buildVnpayUrl] sortedParams:', sortedParams);
        console.log('[VNPAY][buildVnpayUrl] url:', url);
        return url;
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

