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
}
