import { PaymentStatus, OrderStatus, PaymentMethod } from '../../libs/database/src/entities/order.entity';
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

            // Save transaction for main order (will be updated with correct amount later)
            const savedTransaction = await this.paymentTransactionRepo.create({
                order_id: orderId,
                amount, // Will be updated with calculated amount later
                payment_gateway: 'MOMO',
                gateway_txn_ref: body.requestId,
                txn_status: status,
                txn_message: message,
                txn_time: new Date(),
                raw_response_data: body,
            });

            // Update order(s) if payment successful
            if (status === 'SUCCESS' && orderId) {
                // Find all orders that need to be updated (main order + related orders)
                const ordersToUpdate = await this.findRelatedOrdersForPayment(orderId);

                console.log(`[MOMO] 🔄 Updating payment status for orders: ${ordersToUpdate.join(', ')}`);

                // Calculate payment distribution for each order
                const orderPaymentData = await this.calculatePaymentDistribution(ordersToUpdate, amount);

                // Update all related orders with proper payment amounts
                // QUAN TRỌNG: Chỉ cập nhật đơn MOMO (CARD), KHÔNG cập nhật đơn COD (ONSITE)
                for (const orderPayment of orderPaymentData) {
                    try {
                        const order = await this.orderRepository.findById(orderPayment.orderId);
                        if (order) {
                            // Kiểm tra payment_method trước khi cập nhật - CHỈ cập nhật đơn MOMO
                            if (order.payment_method !== PaymentMethod.CARD) {
                                console.log(`[MOMO] ⚠️ Bỏ qua order #${orderPayment.orderId} - không phải đơn MOMO (payment_method: ${order.payment_method})`);
                                continue; // Bỏ qua đơn COD (ONSITE)
                            }
                            
                            order.payment_status = PaymentStatus.PAID;
                            order.status = OrderStatus.CONFIRMED;
                            order.current_order = order.current_order
                                ? { ...order.current_order, payment_status: PaymentStatus.PAID }
                                : { payment_status: PaymentStatus.PAID };

                            await this.orderRepository.save(order);
                            console.log(`[MOMO] ✅ Updated order #${orderPayment.orderId} with amount ${orderPayment.amount}`);

                            // Create/Update transaction record for each order with calculated amounts
                            // LƯU Ý: Chỉ tạo transaction cho đơn MOMO (CARD), không tạo cho đơn COD (ONSITE)
                            // Vì đã có check payment_method ở trên, nên đây chỉ là đơn MOMO
                            if (orderPayment.orderId === orderId) {
                                // Create additional transaction for main order with correct calculated amount
                                await this.paymentTransactionRepo.create({
                                    order_id: orderPayment.orderId,
                                    amount: orderPayment.amount,
                                    payment_gateway: 'MOMO',
                                    gateway_txn_ref: `${body.requestId}_split_main`,
                                    txn_status: status,
                                    txn_message: `Split payment (main order) #${orderPayment.orderId} - Amount: ${orderPayment.amount}đ - ${message}`,
                                    txn_time: new Date(),
                                    raw_response_data: { ...body, split_order_id: orderPayment.orderId, split_amount: orderPayment.amount, is_main_order: true },
                                });
                            } else {
                                // Create transaction for related orders with their calculated amounts
                                await this.paymentTransactionRepo.create({
                                    order_id: orderPayment.orderId,
                                    amount: orderPayment.amount,
                                    payment_gateway: 'MOMO',
                                    gateway_txn_ref: body.requestId, // Same transaction reference for all orders
                                    txn_status: status,
                                    txn_message: `Split payment for order #${orderPayment.orderId} - Amount: ${orderPayment.amount}đ - ${message}`,
                                    txn_time: new Date(),
                                    raw_response_data: { ...body, split_order_id: orderPayment.orderId, split_amount: orderPayment.amount },
                                });
                            }

                            // Send email for guest customers (only once for the main order)
                            if (orderPayment.orderId === orderId) {
                                try {
                                    const customer = await this.customerRepository.findById(order.customer_id);
                                    if (customer && customer.username && customer.username.startsWith('guest_')) {
                                        const customerEmail = customer.email || `order_${orderId}@pottery.com`;
                                        await this.sendMailService.sendOrderConfirmationMail({
                                            to: customerEmail,
                                            orderId: orderId,
                                        });
                                        console.log(`[MOMO] 📧 Email sent to ${customerEmail}`);
                                    }
                                } catch (emailError) {
                                    console.error(`[MOMO] ❌ Email failed for order #${orderId}:`, emailError);
                                }
                            }
                        }
                    } catch (updateError) {
                        console.error(`[MOMO] ❌ Failed to update order #${orderPayment.orderId}:`, updateError);
                    }
                }

                console.log(`[MOMO] ✅ Successfully updated ${orderPaymentData.length} orders`);
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
                // Payment successful - ensure all related orders are updated
                if (orderId) {
                    const ordersToUpdate = await this.findRelatedOrdersForPayment(orderId);
                    console.log(`[MOMO RETURN] 🔄 Ensuring ${ordersToUpdate.length} orders are updated: ${ordersToUpdate.join(', ')}`);

                    // Double-check all orders are properly updated
                    // QUAN TRỌNG: Chỉ cập nhật đơn MOMO (CARD), KHÔNG cập nhật đơn COD (ONSITE)
                    for (const orderIdToUpdate of ordersToUpdate) {
                        try {
                            const order = await this.orderRepository.findById(orderIdToUpdate);
                            // Kiểm tra payment_method trước khi cập nhật - CHỈ cập nhật đơn MOMO
                            if (order && order.payment_method !== PaymentMethod.CARD) {
                                console.log(`[MOMO RETURN] ⚠️ Bỏ qua order #${orderIdToUpdate} - không phải đơn MOMO (payment_method: ${order.payment_method})`);
                                continue; // Bỏ qua đơn COD (ONSITE)
                            }
                            
                            if (order && order.payment_status !== PaymentStatus.PAID) {
                                order.payment_status = PaymentStatus.PAID;
                                order.status = OrderStatus.CONFIRMED;
                                order.current_order = order.current_order
                                    ? { ...order.current_order, payment_status: PaymentStatus.PAID }
                                    : { payment_status: PaymentStatus.PAID };

                                await this.orderRepository.save(order);
                                console.log(`[MOMO RETURN] ✅ Updated order #${orderIdToUpdate}`);
                            }
                        } catch (updateError) {
                            console.error(`[MOMO RETURN] ❌ Failed to update order #${orderIdToUpdate}:`, updateError);
                        }
                    }
                }

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

    private async findRelatedOrdersForPayment(mainOrderId: number): Promise<number[]> {
        const ordersToUpdate: number[] = [mainOrderId];

        try {
            const mainOrder = await this.orderRepository.findById(mainOrderId);
            if (!mainOrder || !mainOrder.customer_id) {
                return ordersToUpdate;
            }

            // Find all other orders from the same customer created within the last 10 minutes
            // that are still unpaid and in CREATED status
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
            const recentOrders = await this.orderRepository.findAll({
                customer_id: mainOrder.customer_id,
                page: 1,
                size: 100
            });

            // Filter orders created around the same time and not yet paid
            // QUAN TRỌNG: Chỉ lấy đơn MOMO (CARD), KHÔNG lấy đơn COD (ONSITE)
            const relatedOrders = recentOrders.orders.filter(order => {
                const orderTime = new Date(order.created_at);
                return order.id !== mainOrderId &&
                    orderTime >= tenMinutesAgo &&
                    order.payment_status === PaymentStatus.UNPAID &&
                    order.status === OrderStatus.CREATED &&
                    order.payment_method === PaymentMethod.CARD; // CHỈ lấy đơn MOMO (CARD), bỏ qua COD (ONSITE)
            });

            // Sort by creation time to ensure consistent ordering
            relatedOrders.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            relatedOrders.forEach(order => {
                if (!ordersToUpdate.includes(order.id)) {
                    ordersToUpdate.push(order.id);
                }
            });

            // Log for debugging
            if (relatedOrders.length > 0) {
                console.log(`[MOMO] Found ${relatedOrders.length} related orders for customer ${mainOrder.customer_id}`);
            }

        } catch (error) {
            console.error('[MOMO] Error finding related orders:', error);
        }

        return ordersToUpdate;
    }

    private async calculatePaymentDistribution(orderIds: number[], totalAmount: number): Promise<{ orderId: number; amount: number; shippingFee: number }[]> {
        const TOTAL_SHIPPING_FEE = 30000; // Total shipping fee for entire payment (30,000đ)
        const result: { orderId: number; amount: number; shippingFee: number }[] = [];

        try {
            // Get all order details
            const orders = await Promise.all(
                orderIds.map(id => this.orderRepository.findById(id))
            );

            const validOrders = orders.filter(order => order !== null);
            if (validOrders.length === 0) return result;

            // Calculate shipping fee per order (divided equally)
            const shippingFeePerOrder = Math.round(TOTAL_SHIPPING_FEE / validOrders.length);

            // Calculate total product amount (excluding shipping) for all orders
            let totalProductAmount = 0;
            const orderProductAmounts: { orderId: number; productAmount: number }[] = [];

            for (const order of validOrders) {
                // Parse current_order to get items and calculate product total
                const currentOrder = order.current_order as any;
                const items = Array.isArray(currentOrder?.items) ? currentOrder.items : [];

                const productAmount = items.reduce((sum: number, item: any) => {
                    return sum + ((item.price_at_order || 0) * (item.quantity || 0));
                }, 0);

                orderProductAmounts.push({
                    orderId: order.id,
                    productAmount: productAmount
                });

                totalProductAmount += productAmount;
            }

            // Distribute payment: each order gets its product amount + divided shipping fee
            for (const orderData of orderProductAmounts) {
                // Each order gets: its product amount + shipping fee divided equally
                const orderAmount = Math.round(orderData.productAmount + shippingFeePerOrder);

                result.push({
                    orderId: orderData.orderId,
                    amount: orderAmount,
                    shippingFee: shippingFeePerOrder
                });

                console.log(`[PAYMENT SPLIT] Order #${orderData.orderId}: Product ${orderData.productAmount}đ + Shipping ${shippingFeePerOrder}đ (=${TOTAL_SHIPPING_FEE}đ÷${validOrders.length}) = Total ${orderAmount}đ`);
            }

            // Verify total matches (with small rounding tolerance)
            const calculatedTotal = result.reduce((sum, item) => sum + item.amount, 0);
            const difference = Math.abs(calculatedTotal - totalAmount);

            console.log(`[PAYMENT SPLIT] Summary: ${validOrders.length} orders, Total shipping ${TOTAL_SHIPPING_FEE}đ ÷ ${validOrders.length} = ${shippingFeePerOrder}đ per order`);

            if (difference > 100) { // Allow 100đ tolerance for rounding
                console.warn(`[PAYMENT SPLIT] Warning: Calculated total ${calculatedTotal}đ differs from actual ${totalAmount}đ by ${difference}đ`);
            }

        } catch (error) {
            console.error('[PAYMENT SPLIT] Error calculating payment distribution:', error);

            // Fallback: distribute equally
            const equalAmount = Math.round(totalAmount / orderIds.length);
            const shippingFeePerOrder = Math.round(TOTAL_SHIPPING_FEE / orderIds.length);
            for (const orderId of orderIds) {
                result.push({
                    orderId: orderId,
                    amount: equalAmount,
                    shippingFee: shippingFeePerOrder
                });
            }
        }

        return result;
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

    @Get('test/payment-split/:order_id')
    async testPaymentSplit(@Param('order_id') order_id: number) {
        try {
            const ordersToUpdate = await this.findRelatedOrdersForPayment(Number(order_id));
            const paymentDistribution = await this.calculatePaymentDistribution(ordersToUpdate, 100000); // Test with 100k

            return {
                success: true,
                mainOrderId: order_id,
                relatedOrders: ordersToUpdate,
                paymentDistribution,
                message: 'Payment split calculation test completed'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Payment split test failed'
            };
        }
    }

    @Get('orders-by-transaction/:transactionRef')
    async getOrdersByTransaction(@Param('transactionRef') transactionRef: string) {
        try {
            console.log('🔍 Finding orders for transaction reference:', transactionRef);

            // Tìm tất cả orders có transaction reference này
            const relatedOrders = await this.orderRepository.findOrdersByGatewayTxnRef(transactionRef);
            console.log('📦 Found orders:', relatedOrders);

            if (!relatedOrders || relatedOrders.length === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy đơn hàng nào với mã giao dịch này',
                    data: []
                };
            }

            // Lấy order IDs
            const orderIds = relatedOrders.map(order => order.id);

            console.log('📦 Found order IDs:', orderIds);

            return {
                success: true,
                message: 'Lấy danh sách đơn hàng thành công',
                data: {
                    orderIds: orderIds,
                    transactionRef: transactionRef
                }
            };
        } catch (error) {
            console.error('❌ Error getting orders by transaction:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách đơn hàng',
                error: error.message
            };
        }
    }
}
