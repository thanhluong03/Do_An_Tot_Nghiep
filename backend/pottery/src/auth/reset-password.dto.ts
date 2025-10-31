import { IsEmail, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
    @IsEmail()
    email: string;

    @IsString()
    @Length(6, 6)
    code: string;

    @IsString()
    @Length(6, 32)
    newPassword: string;

    @IsString()
    @Length(6, 32)
    confirmPassword: string;
}
