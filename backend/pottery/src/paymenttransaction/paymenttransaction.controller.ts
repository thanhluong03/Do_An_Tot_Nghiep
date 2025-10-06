
import { Controller, Post, Body, Req, Get, Query, Res, HttpStatus, Inject, Param } from '@nestjs/common';
import type { Response, Request } from 'express';
import { PaymenttransactionService } from '../../libs/paymenttransaction/src/paymenttransaction.service';
import { VnpayCreatePaymentDto, ListPaymentTransactionRequestDto } from './paymenttransaction.dto';
import { PaymentTransactionRepository } from '../../libs/database/src/repositories/paymenttransaction.repository';
import * as qs from 'querystring';
import * as crypto from 'crypto';

@Controller('paymenttransaction')
export class PaymentTransactionController {
    constructor(
        private readonly paymentService: PaymenttransactionService,
        @Inject(PaymentTransactionRepository)
        private readonly paymentTransactionRepo: PaymentTransactionRepository,
    ) { }

    @Post('vnpay')
    async createVnpayPayment(
        @Body() dto: VnpayCreatePaymentDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const url = this.paymentService.buildVnpayUrl({
            orderId: dto.order_id,
            amount: dto.amount,
            bankCode: dto.bankCode,
        }, Array.isArray(clientIp) ? clientIp[0] : clientIp);
        return res.status(HttpStatus.OK).json({ paymentUrl: url });
    }

    @Get('vnpay/callback')
    async vnpayCallback(
        @Query() query: Record<string, string>,
        @Res() res: Response,
    ) {
        const configService = this.paymentService['configService'];
        const secretKey = configService.get<string>('VNPAY_HASH_SECRET') || '';
        const vnp_SecureHash = query['vnp_SecureHash'];
        const params = { ...query };
        delete params['vnp_SecureHash'];
        delete params['vnp_SecureHashType'];
        const sortedParams = Object.fromEntries(Object.entries(params).sort(([a], [b]) => a.localeCompare(b)));
        const signData = qs.stringify(sortedParams, '&', '=', {
            encodeURIComponent: (v: string) => v,
        });
        const hmac = crypto.createHmac('sha512', secretKey);
        const checkHash = hmac.update(signData).digest('hex');
        if (vnp_SecureHash !== checkHash) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Checksum failed' });
        }
        const order_id = Number(query['vnp_OrderInfo']?.replace(/\D/g, ''));
        const amount = Number(query['vnp_Amount']) / 100;
        const status = query['vnp_ResponseCode'] === '00' ? 'SUCCESS' : 'FAILED';
        const message = query['vnp_Message'] || '';
        await this.paymentTransactionRepo.create({
            order_id,
            amount,
            payment_gateway: 'VNPAY',
            gateway_txn_ref: query['vnp_TxnRef'],
            txn_status: status,
            txn_message: message,
            txn_time: new Date(),
            raw_response_data: query,
        });
        return res.status(HttpStatus.OK).json({ message: 'Payment processed', status });
    }

    @Get()
    async getAllTransactions(@Query() query: ListPaymentTransactionRequestDto) {
        return await this.paymentService.getListTransactions(query);
    }

    @Get('order/:order_id')
    async getTransactionsByOrder(@Param('order_id') order_id: number) {
        return this.paymentTransactionRepo.findByOrderId(Number(order_id));
    }
}
