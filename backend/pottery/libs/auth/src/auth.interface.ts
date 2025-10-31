export interface ForgotPasswordInput {
    email: string;
}

export interface VerifyCodeInput {
    email: string;
    code: string;
}

export interface ResetPasswordInput {
    email: string;
    code: string;
    newPassword: string;
    confirmPassword: string;
}
