"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [sending, setSending] = useState(false);
    const [timer, setTimer] = useState(60);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleSendCode = async () => {
        if (!email.endsWith("@gmail.com")) {
            toast.error("Email phải có đuôi @gmail.com");
            return;
        }
        setSending(true);
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message || "Mã xác thực đã được gửi!");
                setStep(2);
                setTimer(60); // reset timer mỗi lần gửi mã
            } else {
                toast.error(data.message || "Gửi mã xác thực thất bại!");
            }
        } catch {
            toast.error("Có lỗi xảy ra khi gửi mã!");
        }
        setSending(false);
    };
    // Đếm ngược thời gian khi ở bước nhập mã
    useEffect(() => {
        if (step === 2 && timer > 0) {
            timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [step, timer]);

    const handleVerifyCode = async () => {
        const res = await fetch(`${API_URL}/auth/verify-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code }),
        });
        const data = await res.json();
        if (data.success) {
            toast.success(data.message || "Xác thực thành công!");
            setStep(3);
        } else {
            toast.error(data.message || "Xác thực thất bại!");
        }
    };

    const handleResetPassword = async () => {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, newPassword, confirmPassword }),
        });
        const data = await res.json();
        if (data.success) {
            toast.success(data.message || "Đổi mật khẩu thành công!");
            router.push("/login");
        } else {
            toast.error(data.message || "Đổi mật khẩu thất bại!");
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <Toaster position="top-right" />
            <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-10 border border-[#E8E5DA] relative">
                {/* Logo + Tiệm Gốm Nhà Gạo + Slogan */}
                <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-[#65604E] rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                            <img
                                src="/logo.png"
                                alt="Tiệm Gốm Nhà Gạo Logo"
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                        <div className="text-center mt-3">
                            <h1 className="text-2xl font-serif font-bold text-[#2C2A24]">
                                Tiệm Gốm Nhà Gạo
                            </h1>
                            <p className="text-sm text-[#65604E] -mt-1">
                                Nghệ thuật gốm sứ truyền thống
                            </p>
                        </div>
                    </div>
                </div>
                <div className="text-center mb-8 mt-20">
                    <h2 className="text-3xl font-serif font-bold text-[#2C2A24] mb-2">Quên mật khẩu</h2>
                    <p className="text-[#65604E]">Nhập email để nhận mã xác thực và đặt lại mật khẩu mới</p>
                </div>
                {step === 1 && (
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[#2C2A24] mb-2">Nhập Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-[#F5F1EB] rounded-lg focus:ring-2 focus:ring-[#65604E] focus:border-transparent"
                                placeholder="Nhập email của bạn"
                                required
                            />
                        </div>
                        <button
                            type="button"
                            className={`w-full bg-[#65604E] text-white hover:bg-[#3D3A2F] py-3 rounded-lg flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#65604E] disabled:opacity-50 disabled:cursor-not-allowed ${sending ? 'opacity-70 cursor-not-allowed' : ''}`}
                            onClick={handleSendCode}
                            disabled={sending || !email}
                        >
                            {sending ? 'Đang gửi...' : 'Gửi mã xác thực'}
                            {sending && (
                                <svg className="animate-spin h-5 w-5 ml-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                            )}
                        </button>
                    </form>
                )}
                {step === 2 && (
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[#2C2A24] mb-2">Mã xác thực</label>
                            <input
                                type="text"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                maxLength={6}
                                className="w-full px-4 py-3 border border-[#F5F1EB] rounded-lg focus:ring-2 focus:ring-[#65604E] focus:border-transparent tracking-widest text-center"
                                placeholder="Nhập mã xác thực"
                                required
                            />
                            <div className="text-sm text-[#65604E] mt-2 text-center">
                                {timer > 0 ? (
                                    <>Mã sẽ hết hạn sau <span className="font-semibold">{timer}s</span></>
                                ) : (
                                    <>
                                        <span className="text-red-600">Mã đã hết hạn.</span>
                                        <button
                                            type="button"
                                            className={`ml-2 underline text-[#65604E] hover:text-[#2C2A24] font-medium flex items-center justify-center ${sending ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            onClick={handleSendCode}
                                            disabled={sending}
                                        >
                                            {sending && (
                                                <svg className="animate-spin h-4 w-4 mr-1 text-[#65604E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                </svg>
                                            )}
                                            Gửi lại mã
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="w-full bg-[#65604E] text-white hover:bg-[#3D3A2F] py-3 rounded-lg font-medium"
                            onClick={handleVerifyCode}
                            disabled={!code || code.length !== 6 || timer === 0 || sending}
                        >
                            Xác nhận mã
                        </button>
                    </form>
                )}
                {step === 3 && (
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[#2C2A24] mb-2">Mật khẩu mới</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-[#F5F1EB] rounded-lg focus:ring-2 focus:ring-[#65604E] focus:border-transparent"
                                placeholder="Nhập mật khẩu mới"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#2C2A24] mb-2">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-[#F5F1EB] rounded-lg focus:ring-2 focus:ring-[#65604E] focus:border-transparent"
                                placeholder="Nhập lại mật khẩu mới"
                                required
                            />
                        </div>
                        <button
                            type="button"
                            className="w-full bg-[#65604E] text-white hover:bg-[#3D3A2F] py-3 rounded-lg font-medium"
                            onClick={handleResetPassword}
                            disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                        >
                            Đổi mật khẩu
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
