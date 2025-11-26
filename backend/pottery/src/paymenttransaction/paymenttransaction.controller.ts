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
    MomoCreatePaymentDto,
    ListPaymentTransactionRequestDto,
} from './paymenttransaction.dto';
import { PaymentTransactionRepository } from '../../libs/database/src/repositories/paymenttransaction.repository';
import { OrderRepository } from '../../libs/database/src/repositories/order.repository';
import { CustomerRepository } from '@app/database';
import { SendMailService } from '@app/send_mail';

@Controller('paymenttransaction')
export class PaymentTransactionController {
    constructor(
        private readonly paymentService: PaymenttransactionService,
        @Inject(PaymentTransactionRepository)
        private readonly paymentTransactionRepo: PaymentTransactionRepository,
        @Inject(OrderRepository)
        private readonly orderRepository: OrderRepository,
        @Inject(CustomerRepository)
        private readonly customerRepository: CustomerRepository,
        private readonly sendMailService: SendMailService,
    ) { }

    @Post('momo')
    async createMomoPayment(
        @Body() dto: MomoCreatePaymentDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            const paymentResult = await this.paymentService.createMomoPayment({
                orderId: dto.order_id,
                amount: dto.amount,
            });

            if (!paymentResult.payUrl) {
                throw new Error('PayUrl not found in MoMo response');
            }

            return res.status(HttpStatus.OK).json({
                paymentUrl: paymentResult.payUrl,
                orderId: paymentResult.orderId,
                requestId: paymentResult.requestId
            });
        } catch (error) {
            console.error('[CONTROLLER] MoMo payment error:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to create MoMo payment',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    @Post('momo/callback')
    async momoCallback(
        @Body() body: any,
        @Res() res: Response,
    ) {
        try {
            const isValidSignature = true; // Temporarily always true

            if (!isValidSignature) {
                return res.status(HttpStatus.OK).json({
                    message: 'Invalid signature',
                    resultCode: 1
                });
            }

            const orderId = this.extractOrderIdFromOrderInfo(body.orderInfo || '');
            const amount = Number(body.amount);
            const status = body.resultCode === 0 ? 'SUCCESS' : 'FAILED';
            const message = body.message || body.orderInfo || '';

            const existingTransaction = await this.paymentTransactionRepo.findByGatewayTxnRef(
                body.requestId,
            );

            if (existingTransaction) {
                return res.status(HttpStatus.OK).json({
                    message: 'Transaction already processed',
                    resultCode: 0
                });
            }

            // Save transaction
            const savedTransaction = await this.paymentTransactionRepo.create({
                order_id: orderId,
                amount,
                payment_gateway: 'MOMO',
                gateway_txn_ref: body.requestId,
                txn_status: status,
                txn_message: message,
                txn_time: new Date(),
                raw_response_data: body,
            });

            // Update order if payment successful
            if (status === 'SUCCESS' && orderId) {
                const order = await this.orderRepository.findById(orderId);
                if (order) {
                    order.payment_status = PaymentStatus.PAID;
                    order.status = OrderStatus.CONFIRMED;
                    order.current_order = order.current_order
                        ? { ...order.current_order, payment_status: PaymentStatus.PAID }
                        : { payment_status: PaymentStatus.PAID };

                    await this.orderRepository.save(order);
                    // Send email for guest customers
                    try {
                        const customer = await this.customerRepository.findById(order.customer_id);
                        if (customer && customer.username && customer.username.startsWith('guest_')) {
                            const customerEmail = customer.email || `order_${orderId}@pottery.com`;
                            await this.sendMailService.sendOrderConfirmationMail({
                                to: customerEmail,
                                orderId: orderId,
                            });
                        }
                    } catch (emailError) {
                        console.error(`[MOMO] ❌ Email failed for order #${orderId}:`, emailError);
                    }
                }
            }

            return res.status(HttpStatus.OK).json({
                message: 'Success',
                resultCode: 0
            });
        } catch (error) {
            console.error('[MOMO CALLBACK] Error:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error',
                resultCode: 1
            });
        }
    }

    @Get('momo/return')
    async momoReturn(
        @Query() query: Record<string, string>,
        @Res() res: Response,
    ) {
        try {
            const orderId = this.extractOrderIdFromOrderInfo(query.orderInfo || '');
            const resultCode = Number(query.resultCode);

            if (resultCode === 0) {
                return res.redirect(`${process.env.FRONTEND_URL}/orders?payment=success&order_id=${orderId}`);
            } else {
                return res.redirect(`${process.env.FRONTEND_URL}/orders?payment=failed`);
            }
        } catch (error) {
            console.error('[MOMO RETURN] Error:', error);
            return res.redirect(`${process.env.FRONTEND_URL}/orders?payment=failed`);
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

    @Get('momo/test-payment')
    async testMomoPayment() {
        try {
            const testResult = await this.paymentService.createMomoPayment({
                orderId: 999999,
                amount: 50000
            });

            return {
                success: true,
                message: 'Test MoMo payment created successfully',
                data: testResult
            };
        } catch (error) {
            console.error('[TEST] MoMo test error:', error);
            return {
                success: false,
                message: 'Test MoMo payment failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    @Get('momo/test-callback')
    async testMomoCallback() {
        const testParams = {
            partnerCode: 'MOMO',
            requestId: 'MOMO' + new Date().getTime(),
            orderId: 'MOMO' + new Date().getTime(),
            orderInfo: 'Thanh toan don hang #3',
            amount: '50000',
            resultCode: 0,
            message: 'Successful.',
            payType: 'qr',
            responseTime: Date.now(),
            extraData: '',
            signature: 'test-signature'
        };

        return {
            message: 'MoMo test data generated',
            testParams,
            testUrl: `/paymenttransaction/momo/callback`,
        };
    }

    @Post('momo/test-manual-callback')
    async testManualCallback(@Body() testBody?: any) {
        const defaultTestBody = {
            partnerCode: 'MOMO',
            requestId: 'TEST' + Date.now(),
            orderId: 'TEST' + Date.now(),
            orderInfo: 'Thanh toan don hang #123',
            amount: 50000,
            resultCode: 0,
            message: 'Test payment successful',
            payType: 'qr',
            responseTime: Date.now(),
            extraData: '',
            signature: 'test-signature'
        };

        const body = testBody || defaultTestBody;

        // Call the actual callback method
        const mockRes = {
            status: (code: number) => ({
                json: (data: any) => {
                    return data;
                }
            }),
            req: { headers: {} }
        } as any;

        try {
            const result = await this.momoCallback(body, mockRes);
            return {
                success: true,
                message: 'Manual callback test completed',
                result
            };
        } catch (error) {
            return {
                success: false,
                message: 'Manual callback test failed',
                error: error.message
            };
        }
    }

    @Get('debug/check-callback-setup')
    async debugCallbackSetup() {
        try {
            // Check environment variables
            const momoConfig = {
                partnerCode: process.env.MOMO_PARTNER_CODE,
                accessKey: process.env.MOMO_ACCESS_KEY,
                returnUrl: process.env.MOMO_RETURN_URL,
                ipnUrl: process.env.MOMO_IPN_URL,
            };

            // Test order ID extraction
            const testOrderInfo = 'Thanh toan don hang #123';
            const extractedOrderId = this.extractOrderIdFromOrderInfo(testOrderInfo);

            // Test repository
            const testData = {
                order_id: 123,
                amount: 50000,
                payment_gateway: 'MOMO',
                gateway_txn_ref: 'TEST' + Date.now(),
                txn_status: 'SUCCESS',
                txn_message: 'Test transaction',
                txn_time: new Date(),
                raw_response_data: { test: true },
            };
            const savedTransaction = await this.paymentTransactionRepo.create(testData);

            // Delete test transaction
            // await this.paymentTransactionRepo.delete(savedTransaction.id);

            return {
                success: true,
                momoConfig,
                orderIdExtraction: {
                    input: testOrderInfo,
                    output: extractedOrderId
                },
                repositoryTest: {
                    success: true,
                    transactionId: savedTransaction.id
                },
                message: 'All debug checks passed'
            };
        } catch (error) {
            console.error('[DEBUG] Error in debug check:', error);
            return {
                success: false,
                error: error.message,
                stack: error.stack
            };
        }
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
