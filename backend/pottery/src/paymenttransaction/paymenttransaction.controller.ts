import { PaymentStatus, OrderStatus } from '../../libs/database/src/entities/order.entity';
import {
    Controller,
    Post,
    Body,
    Req,
    Get,
    Query,
    Res,
    HttpStatus,
    Inject,
    Param,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { PaymenttransactionService } from '../../libs/paymenttransaction/src/paymenttransaction.service';
import {
    VnpayCreatePaymentDto,
    ListPaymentTransactionRequestDto,
} from './paymenttransaction.dto';
import { PaymentTransactionRepository } from '../../libs/database/src/repositories/paymenttransaction.repository';
import { OrderRepository } from '../../libs/database/src/repositories/order.repository';
import * as crypto from 'crypto';

@Controller('paymenttransaction')
export class PaymentTransactionController {
    constructor(
        private readonly paymentService: PaymenttransactionService,
        @Inject(PaymentTransactionRepository)
        private readonly paymentTransactionRepo: PaymentTransactionRepository,
        @Inject(OrderRepository)
        private readonly orderRepository: OrderRepository,
    ) { }

    @Post('vnpay')
    async createVnpayPayment(
        @Body() dto: VnpayCreatePaymentDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const clientIp =
            req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const url = this.paymentService.buildVnpayUrl(
            {
                orderId: dto.order_id,
                amount: dto.amount,
                bankCode: dto.bankCode,
            },
            Array.isArray(clientIp) ? clientIp[0] : clientIp,
        );
        return res.status(HttpStatus.OK).json({ paymentUrl: url });
    }

    @Get('vnpay/callback')
    async vnpayCallback(
        @Query() query: Record<string, string>,
        @Res() res: Response,
        

    ) {
        try {
            console.log('[VNPAY CALLBACK] 🔔 Received callback:', query);
            const configService = this.paymentService['configService'];
            const secretKey = (configService.get<string>('VNPAY_HASH_SECRET') || '').trim();
            const vnp_SecureHash = query['vnp_SecureHash'];
            const params = { ...query };
            delete params['vnp_SecureHash'];
            delete params['vnp_SecureHashType'];
            const sortedKeys = Object.keys(params).sort();
            const signData = sortedKeys
                .map((key) => {
                    const value = params[key];
                    const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
                    return `${key}=${encodedValue}`;
                })
                .join('&');
            const hmac = crypto.createHmac('sha512', secretKey);
            const checkHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
            if (vnp_SecureHash !== checkHash) {
                const signDataNoEncode = sortedKeys
                    .map((key) => `${key}=${params[key]}`)
                    .join('&');
                const hmacNoEncode = crypto.createHmac('sha512', secretKey);
                const checkHashNoEncode = hmacNoEncode.update(Buffer.from(signDataNoEncode, 'utf-8')).digest('hex');

                if (vnp_SecureHash !== checkHashNoEncode) {
                    return res.status(HttpStatus.OK).json({
                        message: 'Checksum verification failed',
                        status: 'FAILED',
                        error: 'Invalid signature',
                        debug: {
                            receivedHash: vnp_SecureHash,
                            calculatedHashEncoded: checkHash,
                            calculatedHashRaw: checkHashNoEncode,
                            signDataEncoded: signData,
                            signDataRaw: signDataNoEncode,
                        },
                    });
                } else {
                    console.log('[VNPAY CALLBACK] Checksum verified with raw method');
                }
            } else {
                console.log('[VNPAY CALLBACK] Checksum verified with encoded method');
            }
            const order_id = this.extractOrderIdFromOrderInfo(
                query['vnp_OrderInfo'] || '',
            );
            const amount = Number(query['vnp_Amount']) / 100;
            const status = query['vnp_ResponseCode'] === '00' ? 'SUCCESS' : 'FAILED';
            const message = query['vnp_OrderInfo'] || '';

            const existingTransaction =
                await this.paymentTransactionRepo.findByGatewayTxnRef(
                    query['vnp_TxnRef'],
                );
            if (existingTransaction) {
                return res.status(HttpStatus.OK).json({
                    message: 'Transaction already processed',
                    status: existingTransaction.txn_status,
                });
            }
            const savedTransaction = await this.paymentTransactionRepo.create({
                order_id,
                amount,
                payment_gateway: 'VNPAY',
                gateway_txn_ref: query['vnp_TxnRef'],
                txn_status: status,
                txn_message: message,
                txn_time: new Date(),
                raw_response_data: query,
            });

            if (status === 'SUCCESS' && order_id) {
            const order = await this.orderRepository.findById(order_id);
                if (order) {
                order.payment_status = PaymentStatus.PAID;
                order.status = OrderStatus.CONFIRMED; // use OrderStatus enum instead of string literal
                order.current_order = order.current_order
                ? { ...order.current_order, payment_status: PaymentStatus.PAID }
                : { payment_status: PaymentStatus.PAID };

                await this.orderRepository.save(order);

                console.log(`[VNPAY] ✅ Order #${order_id} marked as PAID`);
                return res.redirect(`${process.env.FRONTEND_URL}/orders?payment=success&order_id=${order_id}`);
            } else {
                console.warn(`[VNPAY] ⚠️ Order #${order_id} not found`);
                return res.redirect(`${process.env.FRONTEND_URL}/orders?payment=failed`);
            }
            } else {
            console.log(`[VNPAY] ❌ Payment failed for order #${order_id}`);
            return res.redirect(`${process.env.FRONTEND_URL}/orders?payment=failed`);
            }



            return res.status(HttpStatus.OK).json({
                message: 'Payment processed successfully',
                status,
                transactionId: savedTransaction.id,
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error',
                status: 'FAILED',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    private extractOrderIdFromOrderInfo(orderInfo: string): number {
        const match = orderInfo.match(/#(\d+)/);
        if (match && match[1]) {
            return Number(match[1]);
        }
        const numbers = orderInfo.replace(/\D/g, '');
        return numbers ? Number(numbers) : 0;
    }

    @Get('test')
    testEndpoint() {
        return { message: 'Payment transaction controller is working!' };
    }

    @Get('vnpay/test-callback')
    async testVnpayCallback(@Query() query: Record<string, string>) {
        console.log('[TEST CALLBACK] Received params:', query);
        const testParams = {
            vnp_Amount: '20000000',
            vnp_BankCode: 'NCB',
            vnp_BankTranNo: '4455418',
            vnp_CardType: 'ATM',
            vnp_OrderInfo: 'Thanh toan don hang #3',
            vnp_PayDate: '20251007135845',
            vnp_ResponseCode: '00',
            vnp_TmnCode: '4GFC23T7',
            vnp_TransactionNo: '15193614',
            vnp_TransactionStatus: '00',
            vnp_TxnRef: '1759820197330',
            vnp_SecureHashType: 'SHA512',
        };

        const configService = this.paymentService['configService'];
        const secretKey = configService.get<string>('VNPAY_HASH_SECRET') || '';

        const sortedParams = Object.fromEntries(
            Object.entries(testParams).sort(([a], [b]) => a.localeCompare(b)),
        );

        const signData = Object.entries(sortedParams)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        const hmac = crypto.createHmac('sha512', secretKey);
        const checkHash = hmac.update(signData, 'utf-8').digest('hex');

        testParams['vnp_SecureHash'] = checkHash;

        return {
            message: 'Test data generated',
            testParams,
            testUrl: `/paymenttransaction/vnpay/callback?${new URLSearchParams(testParams).toString()}`,
        };
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
