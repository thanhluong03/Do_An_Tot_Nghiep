import { Body, Controller, Post } from '@nestjs/common';
import { SendMailService } from '@app/send_mail';
import { SendOrderMailDto } from './send-order-mail.dto';

@Controller('mail')
export class MailController {
    constructor(private readonly sendMailService: SendMailService) { }

    @Post('order-confirmation')
    async sendOrderConfirmation(@Body() dto: SendOrderMailDto) {
        const result: any = await this.sendMailService.sendOrderConfirmationMail(
            dto,
        );
        return { success: true, messageId: result?.messageId };
    }

    @Post('order-confirmed')
    async sendOrderConfirmed(@Body() dto: SendOrderMailDto) {
        const result: any = await this.sendMailService.sendOrderConfirmedMail(dto);
        return {
            success: true,
            messageId: result?.messageId,
            message: 'Email xác nhận đơn hàng đã được gửi thành công'
        };
    }

    @Post('order-rejected')
    async sendOrderRejected(@Body() dto: SendOrderMailDto) {
        const result: any = await this.sendMailService.sendOrderRejectedMail(dto);
        return {
            success: true,
            messageId: result?.messageId,
            message: 'Email từ chối đơn hàng đã được gửi thành công'
        };
    }
}
