import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class SendOrderMailDto {
    @IsEmail()
    to: string;

    @IsNumber()
    @IsNotEmpty()
    orderId: number;
}
