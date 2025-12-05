'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { BaseLayout } from '../../../layouts';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart, CartItem } from '../../../contexts/CartContext';
import { orderApi } from '../../../api/modules/orders';
import { paymentApi } from '../../../api/modules/payments';
import { mailApi } from '../../../api/modules/mail';
import { formatPrice } from '../../../utils/format';
import { cartApi } from '../../../api/modules/cart';
import { productApi } from '../../../api/modules/products';
import { voucherApi, Voucher } from '../../../api/modules/voucher';
import { customersApi } from '../../../api/modules/customers';
import { getStoreById } from '../../../api/services/storeService';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { ShoppingBag, Tag, MapPin, CreditCard, Wallet, User, Phone, Mail, CheckCircle, X, Clock, Bot, Gift, MessageSquare, FileText } from 'lucide-react';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, AIChatModal } from '@/components/feature';
import { shippingApi } from '@/api/modules/shipping';

export default function CheckoutPage() {
    const { user, isAuthenticated } = useAuth();
    const { items, clear: clearCart } = useCart();

    // Tự động điền địa chỉ giao hàng nếu user đã đăng nhập và có địa chỉ
    useEffect(() => {
        if (isAuthenticated && user?.address) {
            setAddress(user.address);
        }
    }, [isAuthenticated, user?.address]);

    // Shipping fee states
    const [shippingFee, setShippingFee] = useState(30000); // Default 30k
    const [shippingMessage, setShippingMessage] = useState('Phí vận chuyển mặc định');
    const [calculatingShipping, setCalculatingShipping] = useState(false);
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOMO'>('COD')
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

    // Guest info
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [serverItems, setServerItems] = useState<Array<{
        id: string;
        product_id: number;
        quantity: number;
        store_id: number;
        price?: number;
        classificationPrice?: number;
        classifications?: {
            attribute1_id?: number;
            attribute2_id?: number;
            attribute1_name?: string;
            attribute2_name?: string;
        };
        classificationId?: number;
    }>>([]);
    const [serverProducts, setServerProducts] = useState<Record<number, { id: number; name: string; price: number; images: string[]; promotion?: any }>>({});
    const [loadingCart, setLoadingCart] = useState(false);
    const [storeNames, setStoreNames] = useState<Record<string, string>>({});
    const [hasCheckoutItems, setHasCheckoutItems] = useState(false); // Đánh dấu đã load từ checkout_items
    const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [loadingVouchers, setLoadingVouchers] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        address: '',
        city: '',
    });
    const [note, setNote] = useState('');

    // Build a fallback product map from context items for guest rendering
    const contextProducts = useMemo(() => {
        const map: Record<number, { id: number; name: string; price: number; images: string[] }> = {};
        items.forEach(i => {
            const pid = Number(i.product?.id ?? 0);
            if (!pid) return;
            if (!map[pid]) {
                map[pid] = {
                    id: pid,
                    name: i.product?.name ?? 'Sản phẩm',
                    price: Number(i.product?.price ?? 0),
                    images: i.product?.images ?? [],
                };
            }
        });
        return map;
    }, [items]);

    // 🧹 Function để xóa sạch thông tin guest
    const clearGuestData = useCallback(() => {
        console.log('🧹 Xóa sạch thông tin guest...');
        localStorage.removeItem('guest_id');
        localStorage.removeItem('guest_name');
        localStorage.removeItem('guest_phone');
        localStorage.removeItem('guest_email');
        localStorage.removeItem('auth_type');
        // Reset state về rỗng
        setGuestName('');
        setGuestEmail('');
        setGuestPhone('');
        console.log('✅ Đã xóa sạch thông tin guest');
    }, []);

    // Function để gửi email xác nhận đơn hàng
    const sendOrderConfirmationEmail = useCallback(async (orderId: number) => {
        try {
            // Lấy email khách hàng
            let customerEmail = '';
            if (isAuthenticated && user?.email) {
                customerEmail = user.email;
            } else {
                // Với khách hàng guest, lấy email từ localStorage hoặc state hiện tại
                const storedEmail = localStorage.getItem('guest_email');
                customerEmail = storedEmail || guestEmail.trim() || `guest_${Date.now()}@example.com`;
            }
            console.log('🔄 Đang gửi email xác nhận đơn hàng tới:', customerEmail);

            // Gửi email xác nhận đơn hàng
            await mailApi.sendOrderMail({
                to: customerEmail,
                orderId: orderId,
            });
            console.log('✅ Email xác nhận đơn hàng đã được gửi thành công tới:', customerEmail);
            toast.success('📧 Email xác nhận đơn hàng đã được gửi!');
        } catch (error) {
            console.error('❌ Lỗi gửi email:', error);
            console.error('❌ Chi tiết lỗi:', error);
            toast.error(' Có lỗi khi gửi email xác nhận');
        }
    }, [isAuthenticated, user?.email, guestEmail]);

    async function handleGuestCheckout(customerInfo: any) {
        const savedCart = Cookies.get('cart_session');
        if (!savedCart) {
            toast.error('Giỏ hàng trống!');
            return;
        }
        const cartItems = JSON.parse(savedCart);
        const payload = {
            customer_info: customerInfo,
            items: cartItems.map((item: any) => ({
                product_id: item.product.id,
                quantity: item.quantity,
                price_at_order: item.product.price,
            })),
        };

        const res = await fetch('/api/orders/guest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            Cookies.remove('cart_session'); // clear cart sau khi đặt
            toast.success('Đặt hàng thành công!');
        } else {
            toast.error('Đặt hàng thất bại!');
        }
    }

    /** ===================== LOAD CART & VOUCHERS ===================== */
    useEffect(() => {
        let mounted = true;
        let loadedFromCheckout = false; // Flag local để track xem đã load từ checkout_items chưa

        (async () => {
            // ✅ ƯU TIÊN: Kiểm tra sessionStorage cho các sản phẩm được chọn từ cart TRƯỚC
            // Đọc ngay đầu tiên, không phụ thuộc vào flag
            if (typeof window !== 'undefined') {
                const checkoutItemsStr = sessionStorage.getItem('checkout_items');
                console.log('🔍 Reading from sessionStorage:', checkoutItemsStr ? `Found ${JSON.parse(checkoutItemsStr).length} items` : 'Not found');
                if (checkoutItemsStr) {
                    try {
                        const checkoutItems = JSON.parse(checkoutItemsStr);
                        console.log('🛒 Checkout items from sessionStorage (chỉ sản phẩm đã chọn):', checkoutItems);
                        console.log('🛒 Is array?', Array.isArray(checkoutItems));
                        console.log('🛒 Length:', checkoutItems?.length);

                        if (Array.isArray(checkoutItems) && checkoutItems.length > 0) {
                            // Chỉ sử dụng các sản phẩm được chọn từ cart
                            // Đảm bảo format đúng - chuyển null thành undefined để match với type
                            const formattedItems = checkoutItems.map((item: any) => ({
                                id: String(item.id),
                                product_id: Number(item.product_id),
                                quantity: Number(item.quantity),
                                store_id: Number(item.store_id),
                                price: item.price ? Number(item.price) : undefined,
                                classificationPrice: item.classificationPrice ? Number(item.classificationPrice) : undefined,
                                classificationId: item.classificationId ? Number(item.classificationId) : undefined,
                                classifications: item.classifications || undefined
                            }));

                            console.log('✅ Formatted checkout items:', formattedItems);
                            if (mounted) {
                                setServerItems(formattedItems);
                                setHasCheckoutItems(true); // Đánh dấu đã load từ checkout_items
                                console.log('✅ Set serverItems to checkout items:', formattedItems.length, 'items');
                                console.log('✅ Checkout items details:', formattedItems);
                                loadedFromCheckout = true; // Set flag local
                                // ✅ KHÔNG xóa sessionStorage ngay - để tránh bị override khi re-render
                                // Sẽ xóa khi tạo đơn hàng thành công hoặc khi unmount
                            }

                            if (mounted) setLoadingCart(false); // Load product details sẽ được xử lý ở useEffect khác

                            // Load vouchers trước khi return
                            setLoadingVouchers(true);
                            let vouchers: Voucher[] = [];
                            if (isAuthenticated && user?.id) {
                                try {
                                    vouchers = await voucherApi.fetchCustomerVouchers(user.id);
                                    console.log('✅ Loaded vouchers from API (checkout_items):', vouchers.length, 'vouchers');
                                    console.log('✅ Vouchers details:', vouchers.map(v => ({ id: v.id, voucher_customer_id: v.voucher_customer_id, name: v.name, status: v.status })));
                                } catch (err) {
                                    console.error('❌ Lỗi khi tải voucher người dùng:', err);
                                }
                            } else {
                                try {
                                    vouchers = await voucherApi.fetchAvailableVouchers();
                                } catch { }
                            }
                            if (mounted) {
                                // Filter chỉ lấy voucher có status khác USED (để chắc chắn)
                                const validVouchers = vouchers.filter(v => !v.status || v.status !== 'USED');
                                setAvailableVouchers(validVouchers);
                                setLoadingVouchers(false);
                            }

                            // ✅ DIỆT BỌT TẤT CẢ xử lý khác - CHỈ dùng checkout_items
                            console.log('✅ Sử dụng checkout_items, bỏ qua tất cả fallback logic');
                            return; // CRITICAL: Dừng tại đây, không chạy bất kỳ code nào khác
                        } else {
                            console.warn('⚠️ Checkout items is not a valid array or is empty');
                        }
                    } catch (e) {
                        console.error('❌ Lỗi parse checkout_items:', e);
                        console.error('❌ Raw string:', checkoutItemsStr);
                    }
                }
            }

            // ✅ Nếu đã load từ checkout_items, không chạy phần dưới
            if (loadedFromCheckout) {
                console.log('⏭️ Already loaded from checkout_items, skipping cart load');
                return;
            }

            console.log('🔄 Chỉ có thể ở đây nếu KHÔNG có checkout_items trong sessionStorage');
            console.log('🔄 Loading fallback cart data...');
            setLoadingCart(true);
            try {
                // 🔥 NẾU NGƯỜI DÙNG THẬT ĐĂNG NHẬP → XÓA THÔNG TIN GUEST CŨ
                if (isAuthenticated && user?.id) {
                    const authType = localStorage.getItem('auth_type');
                    if (authType !== 'user') {
                        console.log('🧹 Phát hiện user thật đăng nhập → Xóa thông tin guest cũ');
                        clearGuestData();
                        localStorage.setItem('auth_type', 'user');
                    }
                }

                const params = new URLSearchParams(window.location.search);
                const productId = params.get('productId');
                const storeId = params.get('storeId');
                const quantity = params.get('quantity');
                const price = params.get('price');
                const attribute1_id = params.get('attribute1_id');
                const attribute2_id = params.get('attribute2_id');
                const attribute1_name = decodeURIComponent(params.get('attribute1_name') || '');
                const attribute2_name = decodeURIComponent(params.get('attribute2_name') || '');
                const classificationId = params.get('classificationId');

                console.log('🔍 URL Params:', { productId, storeId, quantity, price, attribute1_id, attribute2_id, attribute1_name, attribute2_name, classificationId });

                // Nếu có đủ 3 param → ưu tiên hiển thị đơn hàng mua ngay
                if (productId && storeId && quantity) {
                    const detail = await productApi.getProductById(productId);

                    // Build server item with classification info if available
                    const serverItem: any = {
                        id: 'buy-now',
                        product_id: Number(productId),
                        quantity: Number(quantity),
                        store_id: Number(storeId),
                        price: price ? Number(price) : Number(detail.price), // Use combo price if available
                    };

                    // Add classification info if available
                    if (attribute1_id && attribute2_id) {
                        serverItem.classificationId = classificationId ? Number(classificationId) : undefined;
                        serverItem.classifications = {
                            attribute1_id: Number(attribute1_id),
                            attribute2_id: Number(attribute2_id),
                            attribute1_name: attribute1_name || '',
                            attribute2_name: attribute2_name || '',
                        };
                        console.log('🏷️ Classifications added to serverItem:', serverItem.classifications);
                    } else {
                        console.log('⚠️ No classification data found in URL params');
                    }

                    setServerItems([serverItem]);
                    setServerProducts({
                        [Number(productId)]: {
                            id: Number(detail.id),
                            name: detail.name,
                            price: Number(detail.price),
                            images: detail.images || [],
                        },
                    });
                    setLoadingCart(false);
                    return;
                }

                // Load cart cho user đã đăng nhập (fallback nếu không có checkout_items)
                // ⚠️ CHỈ chạy nếu KHÔNG load từ checkout_items (loadedFromCheckout = false)
                // ✅ KIỂM TRA: Nếu đã load từ checkout_items, KHÔNG load cart nữa
                if (!loadedFromCheckout && isAuthenticated && user?.id) {
                    const data = await cartApi.getByCustomer(user.id as string);
                    const mapped = (Array.isArray(data) ? data : []).map((ci: any) => ({
                        id: String(ci.id ?? ci._id ?? ''),
                        product_id: Number(ci.product_id),
                        quantity: Number(ci.quantity ?? 1),
                        store_id: Number(ci.store?.id ?? ci.store_id ?? 0),
                        // Add classification info from server cart
                        classificationId: ci.classification_attribute_relationship_id,
                        classifications: ci.classification_attribute_relationship_id ? {
                            attribute1_id: ci.attribute1_id,
                            attribute2_id: ci.attribute2_id,
                            attribute1_name: ci.attribute1_name || '',
                            attribute2_name: ci.attribute2_name || ''
                        } : undefined,
                        // Use classification price from the classification relationship
                        price: ci.classificationRelationship?.price || null,
                        classificationPrice: ci.classificationPrice || null
                    }));
                    console.log('🛒 Server cart items with classifications (FALLBACK - không có checkout_items):', mapped);
                    if (mounted && !loadedFromCheckout) {
                        setServerItems(mapped);
                    }
                } else if (!loadedFromCheckout) {
                    // Load cart cho guest (fallback nếu không có checkout_items)
                    let localItems: any[] | null = null;
                    try {
                        if (typeof window !== 'undefined') {
                            const ss = sessionStorage.getItem('cart_session');
                            if (ss) localItems = JSON.parse(ss);
                        }
                    } catch { }

                    if (!localItems) {
                        const saved = Cookies.get('cart_session');
                        if (saved) localItems = JSON.parse(saved);
                    }

                    if (localItems) {
                        const mapped = await Promise.all(
                            localItems.map(async (i: any, idx: number) => {
                                const pid = Number(i.product?.id ?? i.product_id);
                                let storeId = Number(i.product?.store?.id ?? i.store_id ?? 0);
                                if (!storeId) {
                                    try {
                                        const detail = await productApi.getProductById(String(pid));
                                        const fallback = detail?.stores?.[0]?.store_id;
                                        if (fallback) storeId = Number(fallback);
                                    } catch { }
                                }

                                let classificationId = null;
                                if (i.classificationId) classificationId = i.classificationId;
                                else if (i.classifications && i.classifications.attribute1_id && i.classifications.attribute2_id) {
                                    classificationId = i.classifications.classificationId || null;
                                }

                                return {
                                    id: `guest-${idx}`,
                                    product_id: pid,
                                    quantity: Number(i.quantity ?? 1),
                                    store_id: storeId || 1,
                                    classifications: i.classifications ? {
                                        attribute1_id: i.classifications.attribute1_id,
                                        attribute2_id: i.classifications.attribute2_id,
                                        attribute1_name: i.classifications.attribute1_name || '',
                                        attribute2_name: i.classifications.attribute2_name || ''
                                    } : undefined,
                                    classificationId,
                                    price: i.price, // Keep the classification price from guest cart
                                };
                            })
                        );
                        console.log('🛒 Guest cart items with classifications (FALLBACK - không có checkout_items):', mapped);
                        if (mounted && !hasCheckoutItems) {
                            setServerItems(mapped);
                        }
                    }
                }

                /** 🔥 TẢI DANH SÁCH VOUCHER */
                setLoadingVouchers(true);
                let vouchers: Voucher[] = [];
                if (isAuthenticated && user?.id) {
                    try {
                        vouchers = await voucherApi.fetchCustomerVouchers(user.id);
                        console.log('✅ Loaded vouchers from API (fallback):', vouchers.length, 'vouchers');
                        console.log('✅ Vouchers details:', vouchers.map(v => ({ id: v.id, voucher_customer_id: v.voucher_customer_id, name: v.name, status: v.status })));
                    } catch (err) {
                        console.error('❌ Lỗi khi tải voucher người dùng:', err);
                    }
                } else {
                    // Nếu khách, có thể hiển thị danh sách chung (nếu cần)
                    try {
                        vouchers = await voucherApi.fetchAvailableVouchers();
                    } catch { }
                }
                if (mounted) {
                    // Filter chỉ lấy voucher có status khác USED (để chắc chắn)
                    const validVouchers = vouchers.filter(v => !v.status || v.status !== 'USED');
                    setAvailableVouchers(validVouchers);
                }

            } catch (e) {
                console.error('Lỗi tải giỏ hàng:', e);
            } finally {
                if (mounted) {
                    setLoadingCart(false);
                    setLoadingVouchers(false);
                }
            }
        })();
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user?.id]); // ✅ Chỉ chạy khi isAuthenticated hoặc user.id thay đổi

    /** ===================== LOAD PRODUCTS ===================== */
    useEffect(() => {
        let mounted = true;
        (async () => {
            const missing = serverItems.map(ci => ci.product_id).filter(pid => !serverProducts[pid]);
            if (missing.length === 0) return;

            const results = await Promise.allSettled(missing.map(pid => productApi.getProductById(String(pid))));
            if (!mounted) return;

            const next: Record<number, { id: number; name: string; price: number; images: string[]; promotion?: any }> = { ...serverProducts };
            results.forEach((r, idx) => {
                const pid = missing[idx];
                if (r.status === 'fulfilled' && r.value) {
                    next[pid] = {
                        id: Number(r.value.id),
                        name: r.value.name,
                        price: Number(r.value.price),
                        images: r.value.images || [],
                        promotion: r.value.promotion, // Include promotion data
                    };
                }
            });
            setServerProducts(next);
        })();
        return () => { mounted = false; };
    }, [serverItems, serverProducts]);

    /** ===================== SYNC SERVER PRODUCTS FROM CONTEXT ===================== */
    useEffect(() => {
        const next: Record<number, any> = { ...serverProducts };
        items.forEach(i => {
            const pid = Number(i.product?.id);
            if (pid && !next[pid]) {
                next[pid] = {
                    id: pid,
                    name: i.product?.name || 'Sản phẩm',
                    price: i.product?.price || 0,
                    images: i.product?.images || [],
                };
            }
        });
        setServerProducts(next);
    }, [items]);

    /** ===================== TÍNH TOÁN GIÁ ===================== */
    const { total, discountAmount, finalTotal, totalWithShipping } = useMemo(() => {
        const initialTotal = serverItems.length > 0 ? serverItems.reduce((acc, ci) => {
            const product = serverProducts[ci.product_id];
            if (!product) return acc;

            // Calculate actual price with promotion discount
            let actualPrice = ci.classificationPrice || ci.price || product.price;

            // Apply promotion discount if exists
            if (product.promotion && product.promotion.discount_type && product.promotion.discount_value) {
                const discountValue = Number(product.promotion.discount_value);
                if (product.promotion.discount_type === 'PERCENTAGE') {
                    actualPrice = actualPrice * (1 - discountValue / 100);
                } else if (product.promotion.discount_type === 'FIXED_AMOUNT') {
                    actualPrice = Math.max(0, actualPrice - discountValue);
                }
            }

            console.log('🔍 Server cart item price calculation:', { product: product.name, basePrice: product.price, classificationPrice: ci.classificationPrice, fallbackPrice: ci.price, actualPrice: actualPrice, promotion: product.promotion, classification: ci.classifications });
            return acc + actualPrice * ci.quantity;
        }, 0) : items.reduce((acc, cur) => {
            // For guest items, use classification price if available
            const actualPrice = cur.price || cur.product.price;
            console.log('🔍 Guest cart item price calculation:', { product: cur.product.name, basePrice: cur.product.price, classificationPrice: cur.price, actualPrice: actualPrice, classification: cur.classifications });
            return acc + actualPrice * cur.quantity;
        }, 0);

        let discount = 0;
        if (selectedVoucher) {
            const minOrder = Number(selectedVoucher.min_order_value ?? selectedVoucher.order_conditions ?? 0);
            if (initialTotal >= minOrder) {
                const discountValue = Number(selectedVoucher.discount_value ?? selectedVoucher.voucher_percentage ?? 0);
                const type = String(selectedVoucher.discount_type ?? 'PERCENT').toUpperCase();

                if (type === 'PERCENT' || type === 'PERCENTAGE') discount = Math.round(initialTotal * (discountValue / 100));
                else discount = discountValue;
            }
        }

        const afterDiscount = Math.max(0, initialTotal - discount);
        const withShipping = afterDiscount + shippingFee;

        return { total: initialTotal, discountAmount: discount, finalTotal: afterDiscount, totalWithShipping: withShipping };
    }, [items, serverItems, serverProducts, selectedVoucher, shippingFee]);

    /** ===================== CHỌN VOUCHER ===================== */
    const handleSelectVoucher = (voucher: Voucher) => {
        console.log('🔍 [SELECT VOUCHER] Chọn voucher:', {
            voucherId: voucher.id,
            voucherCustomerId: voucher.voucher_customer_id,
            voucherName: voucher.name || voucher.code,
            currentSelected: selectedVoucher ? {
                id: selectedVoucher.id,
                voucher_customer_id: selectedVoucher.voucher_customer_id
            } : null
        });

        const minOrder = Number(voucher.min_order_value ?? voucher.order_conditions ?? 0);
        if (total < minOrder) {
            setError(`❌ Đơn hàng phải đạt ${formatPrice(minOrder)} để áp dụng mã này.`);
            setSelectedVoucher(null);
            return;
        }
        setError(null);

        // So sánh bằng voucher_customer_id hoặc id
        const isSameVoucher = (selectedVoucher?.voucher_customer_id && voucher.voucher_customer_id &&
            selectedVoucher.voucher_customer_id === voucher.voucher_customer_id) ||
            (selectedVoucher?.id && voucher.id &&
                Number(selectedVoucher.id) === Number(voucher.id));

        console.log('🔍 [SELECT VOUCHER] isSameVoucher:', isSameVoucher);
        setSelectedVoucher(isSameVoucher ? null : voucher);
        console.log('✅ [SELECT VOUCHER] Đã set selectedVoucher:', isSameVoucher ? null : voucher);
    };

    const handlePayment = async (orderId: number, amount: number) => {
        try {
            console.log('💳 Khởi tạo thanh toán MoMo với:', { orderId, amount: formatPrice(amount) });

            const pay = await paymentApi.createMomoPayment(orderId, amount);

            console.log('🔍 Raw API Response:', pay);
            console.log('🔍 Response type:', typeof pay);
            console.log('🔍 Response keys:', Object.keys(pay || {}));

            // Check multiple possible fields for payment URL
            const paymentUrl = pay?.paymentUrl || pay?.data?.paymentUrl || pay?.url || pay?.redirectUrl || pay?.payUrl;

            console.log('🔍 Extracted paymentUrl:', paymentUrl);

            if (!paymentUrl) {
                console.error('❌ Không tìm thấy paymentUrl trong response:', pay);
                throw new Error('Không lấy được đường dẫn thanh toán từ MoMo');
            }

            console.log('✅ Redirecting to MoMo payment:', paymentUrl);
            window.location.href = paymentUrl;

        } catch (e: unknown) {
            console.error('❌ Chi tiết lỗi thanh toán MoMo:', e);
            const error = e as Error & { response?: { data?: { message?: string; error?: string }; status?: number } };

            // Lấy thông báo lỗi từ response
            let message = 'Lỗi không xác định';
            if (error.response?.data) {
                message = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
            } else if (error.message) {
                message = error.message;
            }

            if (error.response) {
                console.error('❌ API Response Error:', error.response.data);
                console.error('❌ API Response Status:', error.response.status);
            }

            // Hiển thị thông báo lỗi chi tiết hơn
            const errorMessage = error.response?.status === 500
                ? 'Lỗi server khi tạo thanh toán MOMO. Vui lòng kiểm tra backend logs hoặc thử lại sau.'
                : `Không thể khởi tạo thanh toán MoMo: ${message}`;

            toast.error(errorMessage);

            // Không set creating = false ở đây vì đã return ở trên
            // Nhưng cần đảm bảo state được reset nếu có lỗi
            setCreating(false);
        }
    };

    const validateForm = useCallback(() => {
        const errors = { guestName: '', guestPhone: '', guestEmail: '', address: '', city: '' };
        let isValid = true;

        if (!isAuthenticated) {
            if (!guestName.trim()) { errors.guestName = 'Vui lòng nhập họ và tên.'; isValid = false; }
            if (!guestPhone.trim()) { errors.guestPhone = 'Vui lòng nhập số điện thoại.'; isValid = false; }
            else if (!/^(0[3|5|7|8|9])+([0-9]{8})\b/.test(guestPhone)) { errors.guestPhone = 'Số điện thoại không hợp lệ.'; isValid = false; }
            if (guestEmail.trim() && !/\S+@\S+\.\S+/.test(guestEmail)) { errors.guestEmail = 'Địa chỉ email không hợp lệ.'; isValid = false; }
        }

        if (!address.trim()) { errors.address = 'Vui lòng nhập địa chỉ giao hàng.'; isValid = false; }
        if (!city.trim()) { errors.city = 'Vui lòng nhập tỉnh/thành phố.'; isValid = false; }

        setFormErrors(errors);
        return isValid;
    }, [isAuthenticated, guestName, guestPhone, guestEmail, address, city]);

    /** ===================== SYNC GUEST CART FROM CONTEXT ===================== */
    useEffect(() => {
        // ✅ KHÔNG sync nếu đã có checkout_items từ cart (sản phẩm đã được chọn)
        if (hasCheckoutItems) {
            console.log('🚫 Bỏ qua sync từ context vì đã có checkout_items');
            return;
        }

        // ✅ KIỂM TRA sessionStorage trước khi sync từ context
        if (typeof window !== 'undefined') {
            const checkoutItemsStr = sessionStorage.getItem('checkout_items');
            if (checkoutItemsStr) {
                console.log('🚫 Bỏ qua sync từ context vì có checkout_items trong sessionStorage');
                return;
            }
        }

        if (!isAuthenticated && items.length > 0) {
            console.log('🔄 Sync từ context vì không có checkout_items:', items.length, 'items');
            const mapped = items.map((i, idx) => ({
                id: `guest-${idx}`,
                product_id: Number(i.product?.id),
                quantity: i.quantity,
                store_id: Number(i.storeId || i.product?.store?.id || 1),
                price: i.price || i.product.price,
                classificationId: i.classificationId || undefined,
                classifications: i.classifications ? {
                    attribute1_id: i.classifications.attribute1_id ?? undefined,
                    attribute2_id: i.classifications.attribute2_id ?? undefined,
                    attribute1_name: i.classifications.attribute1_name ?? undefined,
                    attribute2_name: i.classifications.attribute2_name ?? undefined,
                } : undefined,
            }));
            setServerItems(mapped);
        }
    }, [isAuthenticated, items, hasCheckoutItems]);

    // Effect to fetch store names
    useEffect(() => {
        const fetchStoreNames = async () => {
            const itemsToCheck = serverItems.length > 0 ? serverItems : items;
            if (itemsToCheck.length === 0) return;

            const storeIds = new Set<string>();
            itemsToCheck.forEach(item => {
                const storeId = (item as any).store_id || (item as any).storeId || (item as any).product?.store?.id;
                if (storeId) storeIds.add(String(storeId));
            });

            if (storeIds.size === 0) return;

            const newStoreNames: Record<string, string> = {};

            for (const storeId of Array.from(storeIds)) {
                try {
                    // Thử lấy từ cart context items trước
                    const contextItem = items.find(i => {
                        const itemStoreId = i.storeId || i.product?.store?.id;
                        return String(itemStoreId) === storeId;
                    });

                    // Ưu tiên storeName từ cart item
                    if (contextItem?.storeName && contextItem.storeName !== 'Cửa hàng') {
                        newStoreNames[storeId] = contextItem.storeName;
                        continue;
                    }

                    // Nếu không có, thử lấy từ product.store
                    if (contextItem?.product?.store?.name && contextItem.product.store.name !== 'Cửa hàng') {
                        newStoreNames[storeId] = contextItem.product.store.name;
                        continue;
                    }

                    // Nếu không có trong context, gọi API
                    try {
                        const storeData = await getStoreById(Number(storeId));
                        newStoreNames[storeId] = storeData.store_name || `Cửa hàng #${storeId}`;
                    } catch {
                        newStoreNames[storeId] = `Cửa hàng #${storeId}`;
                    }
                } catch {
                    newStoreNames[storeId] = `Cửa hàng #${storeId}`;
                }
            }

            setStoreNames(newStoreNames);
        };

        fetchStoreNames();
    }, [serverItems, items]);

    /** ===================== TÍNH PHÍ VẬN CHUYỂN DỰA TRÊN KHOẢNG CÁCH ===================== */
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const calculateShipping = async () => {
            // Only calculate if both address and city are provided
            if (!address.trim() || !city.trim()) {
                setShippingFee(30000);
                setShippingMessage('Vui lòng nhập địa chỉ để tính phí vận chuyển');
                return;
            }

            setCalculatingShipping(true);
            console.log('🚚 Starting shipping fee calculation for all stores...');

            try {
                // Lấy danh sách tất cả các cửa hàng từ items
                const allItems = serverItems.length > 0 ? serverItems : items;
                const storeIds = [...new Set(allItems.map(item =>
                    serverItems.length > 0 ? item.store_id : (item.storeId || item.product?.store?.id)
                ))];

                console.log('📍 Found stores:', storeIds);

                // Tính phí vận chuyển cho từng cửa hàng
                let totalShippingFee = 0;
                const shippingResults = [];

                for (const storeId of storeIds) {
                    if (!storeId) continue;

                    let storeAddress = 'Nam Từ Liêm, Hà Nội'; // Default

                    try {
                        const storeData = await getStoreById(Number(storeId));
                        if (storeData.address) {
                            storeAddress = storeData.address;
                        }
                        console.log(`📍 Store ${storeId} address:`, storeAddress);
                    } catch (err) {
                        console.warn(`⚠️ Could not fetch store ${storeId} address, using default`);
                    }

                    try {
                        const result = await shippingApi.calculateFee({
                            storeAddress,
                            deliveryAddress: address.trim(),
                            city: city.trim(),
                        });

                        console.log(`✅ Store ${storeId} shipping:`, result.fee);
                        totalShippingFee += result.fee;
                        shippingResults.push({ storeId, fee: result.fee, message: result.message });
                    } catch (err) {
                        console.warn(`⚠️ Error calculating shipping for store ${storeId}, using default 30k`);
                        totalShippingFee += 30000;
                        shippingResults.push({ storeId, fee: 30000, message: 'Phí mặc định' });
                    }
                }

                console.log('✅ Total shipping fee from all stores:', totalShippingFee);
                setShippingFee(totalShippingFee);

                // Tạo message tổng hợp
                if (storeIds.length > 1) {
                    setShippingMessage(`Phí vận chuyển ${storeIds.length} cửa hàng`);
                } else {
                    setShippingMessage(shippingResults[0]?.message || 'Đã tính phí vận chuyển');
                }

                if (totalShippingFee === 0) {
                    toast.success(`🎉 Miễn phí vận chuyển cho tất cả ${storeIds.length} cửa hàng!`, { duration: 3000 });
                }
            } catch (error: any) {
                console.error('❌ Error calculating shipping fee:', error);
                const errorMsg = error?.response?.data?.message || error?.message || 'Không thể tính phí vận chuyển';
                setShippingFee(30000);
                setShippingMessage(`Áp dụng phí mặc định - ${errorMsg}`);
                toast.error(`⚠️ ${errorMsg}`, { duration: 4000 });
            } finally {
                setCalculatingShipping(false);
            }
        };

        // Debounce calculation to avoid too many API calls
        timeoutId = setTimeout(calculateShipping, 1200);

        return () => clearTimeout(timeoutId);
    }, [address, city, serverItems, items]);

    /** ===================== TẠO ĐƠN HÀNG VÀ XÓA SẢN PHẨM ĐÃ CHỌN ===================== */
    const handleCreate = async () => {
        if (loadingCart) return setError('⏳ Đang tải giỏ hàng, vui lòng thử lại sau');
        const cartItems = serverItems.length > 0 ? serverItems : items;
        console.log('🛒 Using cart items for checkout:', cartItems);

        if (!cartItems.length) return setError('❌ Giỏ hàng trống');

        if (!validateForm()) return;

        setCreating(true);
        setError(null);

        // Lấy danh sách ID của các mục cần xóa khỏi Server Cart
        // Chỉ áp dụng cho User đã đăng nhập và không phải là item 'buy-now'
        const serverCartItemIdsToDelete: string[] = isAuthenticated
            ? serverItems
                .filter(ci => ci.id && String(ci.id).startsWith('buy-now') === false)
                .map(ci => String(ci.id))
            : [];

        if (isAuthenticated) {
            console.log('✅ Identified Server Cart Item IDs to delete:', serverCartItemIdsToDelete);
        } else {
            console.log('✅ Guest checkout detected.');
        }

        try {
            let customerId: number | null = null;
            const authType = localStorage.getItem('auth_type');
            const storedGuestId = localStorage.getItem('guest_id');

            // ✅ Nếu user thật (đã đăng nhập)
            if (isAuthenticated && authType === 'user') {
                const storedCustomerId = localStorage.getItem('customerId');
                if (storedCustomerId) {
                    customerId = Number(storedCustomerId);
                } else throw new Error('Không tìm thấy customerId. Vui lòng đăng xuất và đăng nhập lại.');
            }
            // ✅ Nếu là guest
            else {
                if (storedGuestId) {
                    customerId = Number(storedGuestId);
                } else {
                    if (!guestName.trim() || !guestPhone.trim()) {
                        throw new Error('Vui lòng nhập họ tên và số điện thoại để đặt hàng.');
                    }

                    const fallbackEmail = guestEmail.trim() || `guest_${Date.now()}@example.com`;
                    const created = await customersApi.createCustomer({
                        username: `guest_${Date.now()}`,
                        password: `guest-${Math.random().toString(36).slice(2)}`,
                        full_name: guestName.trim(),
                        email: fallbackEmail,
                        phone_number: guestPhone.trim(),
                        address: `${address.trim()}, ${city.trim()}`,
                    });

                    customerId = Number(created?.id ?? created?.data?.id ?? created?.customer?.id);
                    if (!customerId) throw new Error('Không thể tạo khách hàng tạm thời.');

                    // Lưu guest info
                    localStorage.setItem('guest_id', String(customerId));
                    localStorage.setItem('guest_name', guestName.trim());
                    localStorage.setItem('guest_phone', guestPhone.trim());
                    localStorage.setItem('guest_email', fallbackEmail);
                    localStorage.setItem('auth_type', 'guest');
                }
            }

            // Build payload items
            const payloadItems = cartItems.map(ci => {
                const isServerItem = 'product_id' in ci;
                const pid = isServerItem ? Number(ci.product_id) : Number(ci.product?.id ?? 0);
                const quantity = ci.quantity;
                const storeId = isServerItem ? Number(ci.store_id) : Number(ci.product?.store?.id || 1);

                let actualPrice: number;
                if (isServerItem) {
                    const serverItem = ci as typeof serverItems[0];
                    actualPrice = serverItem.classificationPrice || serverItem.price || Number(serverProducts[pid]?.price ?? 0);

                    // Apply promotion
                    const product = serverProducts[pid];
                    if (product?.promotion && product.promotion.discount_type && product.promotion.discount_value) {
                        const discountValue = Number(product.promotion.discount_value);
                        if (product.promotion.discount_type === 'PERCENTAGE') actualPrice *= 1 - discountValue / 100;
                        else if (product.promotion.discount_type === 'FIXED_AMOUNT') actualPrice = Math.max(0, actualPrice - discountValue);
                    }
                } else {
                    const guestItem = ci as CartItem;
                    actualPrice = guestItem.price || guestItem.product.price;
                }

                const share = total > 0 ? (actualPrice * quantity) / total : 0;
                const discountedPrice = actualPrice - (share * discountAmount) / quantity;

                let classificationId = null, attribute1Name = '', attribute2Name = '';
                if (isServerItem) {
                    const serverItem = ci as typeof serverItems[0];
                    classificationId = serverItem.classificationId || null;
                    attribute1Name = serverItem.classifications?.attribute1_name || '';
                    attribute2Name = serverItem.classifications?.attribute2_name || '';
                } else {
                    const guestItem = ci as CartItem;
                    classificationId = guestItem.classificationId || null;
                    attribute1Name = guestItem.classifications?.attribute1_name || '';
                    attribute2Name = guestItem.classifications?.attribute2_name || '';
                }

                return {
                    product_id: pid,
                    quantity,
                    price_at_order: Math.round(discountedPrice),
                    store_id: storeId,
                    classification_attribute_relationship_id: classificationId,
                    attribute1_name: attribute1Name,
                    attribute2_name: attribute2Name,
                };
            });

            // Nhóm items theo store_id
            const itemsByStore: Record<number, typeof payloadItems> = {};
            payloadItems.forEach(item => {
                if (!itemsByStore[item.store_id]) itemsByStore[item.store_id] = [];
                itemsByStore[item.store_id].push(item);
            });

            // Tạo đơn cho từng cửa hàng - TẠO TẤT CẢ ĐƠN TRƯỚC
            const storeIds = Object.keys(itemsByStore).map(Number);
            const createdOrderIds: number[] = [];
            let totalAmountForPayment = 0; // Tổng tiền của tất cả các đơn
            let totalShippingFee = 0; // Tổng phí ship của tất cả các đơn

            for (const storeId of storeIds) {
                const storeItems = itemsByStore[storeId];
                const storeTotalBeforeDiscount = storeItems.reduce((sum, i) => sum + i.price_at_order * i.quantity, 0);
                const storeDiscount = total > 0 ? storeItems.reduce((sum, i) => sum + ((i.price_at_order * i.quantity) / total) * discountAmount, 0) : 0;
                const storeFinalTotal = Math.max(0, storeTotalBeforeDiscount - storeDiscount);

                // Calculate shipping fee for this specific store
                let storeShippingFee = 30000; // Default fee
                try {
                    const storeData = await getStoreById(Number(storeId));
                    const storeAddress = storeData.address || 'Nam Từ Liêm, Hà Nội';
                    console.log(`🚚 Calculating shipping for store ${storeId}:`, { storeAddress, deliveryAddress: address, city });

                    const result = await shippingApi.calculateFee({
                        storeAddress,
                        deliveryAddress: address.trim(),
                        city: city.trim(),
                    });

                    storeShippingFee = result.fee;
                    console.log(`✅ Shipping fee for store ${storeId}: ${storeShippingFee}đ`);
                } catch (err) {
                    console.warn(`⚠️ Could not calculate shipping for store ${storeId}, using default:`, err);
                }

                totalShippingFee += storeShippingFee;

                // Add shipping fee to each item from this store
                const itemsWithShipping = storeItems.map(item => ({
                    ...item,
                    shipping_fee: Math.round(storeShippingFee / storeItems.length), // Divide shipping fee among items from same store
                }));

                const payloadPerStore = {
                    customer_id: customerId,
                    shipping_address: `${address.trim()}, ${city.trim()}`,
                    voucher_id: selectedVoucher ? Number(selectedVoucher.id) : null,
                    payment_method: paymentMethod === 'COD' ? 'ONSITE' : 'CARD',
                    status: 'CREATED',
                    payment_status: paymentMethod === 'COD' ? 'UNPAID' : undefined,
                    items: itemsWithShipping,
                    note,
                };

                console.log(`📦 Tạo đơn cho cửa hàng ${storeId}`, payloadPerStore);

                const res = await orderApi.createOrder(payloadPerStore);
                const createdId = Number(res?.data?.id ?? res?.id);
                if (!createdId) throw new Error(`Không thể tạo đơn cho cửa hàng ${storeId}`);

                createdOrderIds.push(createdId);
                totalAmountForPayment += storeFinalTotal; // Cộng dồn tổng tiền không có ship

                // COD email cho guest
                if (paymentMethod === 'COD' && !isAuthenticated) {
                    await sendOrderConfirmationEmail(createdId);
                }
            }

            // Sau khi tạo TẤT CẢ các đơn, xử lý thanh toán
            // Cộng phí ship đã tính cho từng cửa hàng
            totalAmountForPayment += totalShippingFee;

            // 🔥 Cập nhật trạng thái voucher đã sử dụng SAU KHI TẠO ĐƠN HÀNG THÀNH CÔNG (cho cả COD và MOMO)
            if (isAuthenticated && user?.id && selectedVoucher && selectedVoucher.id) {
                console.log('🔍 [VOUCHER UPDATE] Kiểm tra điều kiện cập nhật voucher:', {
                    isAuthenticated,
                    userId: user?.id,
                    voucherId: selectedVoucher.id,
                    voucherCustomerId: selectedVoucher.voucher_customer_id,
                    voucherName: selectedVoucher.name,
                });

                // Lấy voucher_customer_id từ selectedVoucher (backend đã trả về)
                let voucherCustomerId: number | undefined = undefined;

                // Ưu tiên lấy từ selectedVoucher trước (backend đã trả về)
                if (selectedVoucher.voucher_customer_id) {
                    voucherCustomerId = Number(selectedVoucher.voucher_customer_id);
                    console.log('✅ [VOUCHER UPDATE] Lấy voucher_customer_id từ selectedVoucher:', voucherCustomerId);
                } else {
                    // Nếu không có, query lại từ API helper
                    console.log(`⚠️ [VOUCHER UPDATE] Không có voucher_customer_id trong selectedVoucher, query lại từ voucher_id=${selectedVoucher.id} và customer_id=${user.id}`);
                    try {
                        const queriedId = await voucherApi.getVoucherCustomerIdByVoucherAndCustomer(user.id, selectedVoucher.id);
                        if (queriedId) {
                            voucherCustomerId = queriedId;
                            console.log('✅ [VOUCHER UPDATE] Lấy voucher_customer_id sau khi query lại:', voucherCustomerId);
                        } else {
                            console.warn('⚠️ [VOUCHER UPDATE] Không tìm thấy voucher_customer_id');
                        }
                    } catch (queryError) {
                        console.error('❌ [VOUCHER UPDATE] Lỗi query voucher_customer_id:', queryError);
                    }
                }

                console.log('🔍 [VOUCHER UPDATE] voucher_customer_id cuối cùng:', voucherCustomerId);

                if (voucherCustomerId) {
                    try {
                        console.log(`✨ [VOUCHER UPDATE] Bắt đầu cập nhật voucher_customer_id=${voucherCustomerId} cho user_id=${user.id}`);

                        // Cập nhật status voucher trên server thành USED TRƯỚC
                        console.log(`📤 [VOUCHER UPDATE] Gọi API: PUT /vouchers/updatevouchercustomerstatus/${voucherCustomerId} với payload: { status: 'USED' }`);
                        const result = await voucherApi.updateVoucherCustomerStatus(voucherCustomerId);
                        console.log('✅ [VOUCHER UPDATE] Kết quả cập nhật voucher:', result);
                        console.log('✅ [VOUCHER UPDATE] Status trong response:', result?.voucherCustomer?.status);

                        if (result?.voucherCustomer?.status === 'USED') {
                            console.log('✅ [VOUCHER UPDATE] Voucher đã được cập nhật status thành USED trong DB');

                            // Xóa voucher khỏi UI sau khi cập nhật thành công
                            setAvailableVouchers(prev => prev.filter(v => {
                                const vId = v.voucher_customer_id || v.id;
                                const selectedId = voucherCustomerId;
                                const shouldKeep = vId !== selectedId;
                                if (!shouldKeep) {
                                    console.log(`🗑️ [VOUCHER UPDATE] Xóa voucher khỏi UI: voucher_customer_id=${vId}`);
                                }
                                return shouldKeep;
                            }));
                            setSelectedVoucher(null);

                            // Reload lại danh sách vouchers từ server để đảm bảo đồng bộ
                            try {
                                console.log('🔄 [VOUCHER UPDATE] Reloading vouchers after update...');
                                const updatedVouchers = await voucherApi.fetchCustomerVouchers(user.id);
                                console.log('📥 [VOUCHER UPDATE] Số lượng voucher sau khi reload:', updatedVouchers.length);
                                // Filter lại để chỉ hiển thị voucher có status khác USED
                                const validVouchers = updatedVouchers.filter(v => {
                                    const isValid = !v.status || v.status !== 'USED';
                                    if (!isValid) {
                                        console.log(`🚫 [VOUCHER UPDATE] Filter voucher USED: id=${v.id}, voucher_customer_id=${v.voucher_customer_id}, status=${v.status}`);
                                    }
                                    return isValid;
                                });
                                setAvailableVouchers(validVouchers);
                                console.log('✅ [VOUCHER UPDATE] Đã reload lại danh sách vouchers, số lượng hợp lệ:', validVouchers.length);
                                toast.success('✅ Voucher đã được sử dụng thành công!');
                            } catch (reloadError) {
                                console.error('❌ [VOUCHER UPDATE] Lỗi reload vouchers:', reloadError);
                                toast.success('✅ Voucher đã được sử dụng!');
                            }
                        } else {
                            console.warn('⚠️ [VOUCHER UPDATE] Status không phải USED sau khi cập nhật:', result?.voucherCustomer?.status);
                        }
                    } catch (voucherError: any) {
                        console.error('❌ [VOUCHER UPDATE] Lỗi cập nhật trạng thái voucher:', {
                            error: voucherError,
                            message: voucherError?.message,
                            response: voucherError?.response?.data,
                            status: voucherError?.response?.status,
                            voucherCustomerId,
                        });
                        toast.error(`Không thể cập nhật trạng thái voucher: ${voucherError?.message || 'Lỗi không xác định'}`);
                        // Nếu lỗi, thử reload lại danh sách từ server
                        try {
                            const updatedVouchers = await voucherApi.fetchCustomerVouchers(user.id);
                            const validVouchers = updatedVouchers.filter(v => !v.status || v.status !== 'USED');
                            setAvailableVouchers(validVouchers);
                        } catch (reloadError) {
                            console.error('❌ [VOUCHER UPDATE] Lỗi reload vouchers sau khi có lỗi:', reloadError);
                        }
                    }
                } else {
                    console.error('❌ [VOUCHER UPDATE] Không tìm thấy voucher_customer_id cho voucher:', {
                        selectedVoucher: {
                            id: selectedVoucher.id,
                            voucher_customer_id: selectedVoucher.voucher_customer_id,
                            name: selectedVoucher.name,
                        },
                        availableVouchers: availableVouchers.map(v => ({ id: v.id, voucher_customer_id: v.voucher_customer_id })),
                    });
                    toast.error('Không tìm thấy thông tin voucher. Vui lòng thử lại.');
                    // Vẫn xóa voucher khỏi UI nếu không có voucher_customer_id
                    setAvailableVouchers(prev => prev.filter(v => v.id !== selectedVoucher.id));
                    setSelectedVoucher(null);
                }
            } else {
                console.warn('⚠️ [VOUCHER UPDATE] Điều kiện không đúng để cập nhật voucher:', {
                    isAuthenticated,
                    hasUserId: !!user?.id,
                    hasSelectedVoucher: !!selectedVoucher,
                });
            }

            // 🔥 Lưu voucher_customer_id vào sessionStorage cho MOMO để cập nhật sau khi thanh toán thành công
            if (paymentMethod === 'MOMO' && isAuthenticated && user?.id && selectedVoucher) {
                // Lấy voucher_customer_id từ selectedVoucher (backend đã trả về)
                let voucherCustomerIdForMomo: number | undefined = undefined;

                if (selectedVoucher.voucher_customer_id) {
                    voucherCustomerIdForMomo = Number(selectedVoucher.voucher_customer_id);
                    console.log('✅ [VOUCHER UPDATE MOMO] Lấy voucher_customer_id từ selectedVoucher:', voucherCustomerIdForMomo);
                } else if (selectedVoucher.id) {
                    // Nếu không có, lưu voucher_id và customer_id để query lại
                    sessionStorage.setItem('selected_voucher_id', String(selectedVoucher.id));
                    sessionStorage.setItem('selected_customer_id', String(user.id));
                    console.log('💾 [VOUCHER UPDATE MOMO] Đã lưu voucher_id và customer_id cho thanh toán MOMO (sẽ query lại sau):', {
                        voucherId: selectedVoucher.id,
                        customerId: user.id,
                    });
                }

                if (voucherCustomerIdForMomo) {
                    sessionStorage.setItem('selected_voucher_customer_id', String(voucherCustomerIdForMomo));
                    console.log('💾 [VOUCHER UPDATE MOMO] Đã lưu voucher_customer_id cho thanh toán MOMO:', voucherCustomerIdForMomo);
                }
            }

            if (paymentMethod === 'MOMO') {
                // 🔥 QUAN TRỌNG: Rollback các đơn COD ngay sau khi tạo đơn MOMO
                // Backend callback có thể đã cập nhật nhầm các đơn COD, cần rollback ngay
                if (isAuthenticated && user?.id) {
                    try {
                        console.log('🔄 Bắt đầu rollback các đơn COD ngay sau khi tạo đơn MOMO...');
                        const allCustomerOrders = await orderApi.getOrdersByCustomer(user.id as string, 1, 100);

                        // Xử lý nhiều cấu trúc response có thể có
                        let ordersList: any[] = [];
                        if (Array.isArray(allCustomerOrders)) {
                            ordersList = allCustomerOrders;
                        } else if (allCustomerOrders?.data) {
                            if (Array.isArray(allCustomerOrders.data)) {
                                ordersList = allCustomerOrders.data;
                            } else if (allCustomerOrders.data?.orders && Array.isArray(allCustomerOrders.data.orders)) {
                                ordersList = allCustomerOrders.data.orders;
                            } else if (allCustomerOrders.data?.data && Array.isArray(allCustomerOrders.data.data)) {
                                ordersList = allCustomerOrders.data.data;
                            }
                        } else if (allCustomerOrders?.orders && Array.isArray(allCustomerOrders.orders)) {
                            ordersList = allCustomerOrders.orders;
                        }

                        // Tìm các order COD đã bị cập nhật nhầm (PAID hoặc CONFIRMED)
                        const codOrdersToRollback = ordersList.filter((order: any) => {
                            const paymentMethod = order?.payment_method || order?.current_order?.payment_method;
                            const paymentStatus = order?.payment_status || order?.current_order?.payment_status;
                            const orderStatus = order?.status || order?.current_order?.status;
                            const isCOD = paymentMethod === 'ONSITE' || paymentMethod === 'COD';
                            const isPaid = paymentStatus === 'PAID';
                            const isConfirmed = orderStatus === 'CONFIRMED';
                            // Loại trừ các order MOMO vừa tạo
                            const isNotMomoOrder = !createdOrderIds.includes(order.id);
                            // Rollback nếu đơn COD bị cập nhật nhầm (PAID hoặc CONFIRMED)
                            return isCOD && (isPaid || isConfirmed) && isNotMomoOrder;
                        });

                        if (codOrdersToRollback.length > 0) {
                            console.log(`⚠️ Phát hiện ${codOrdersToRollback.length} đơn COD đã bị cập nhật nhầm, đang rollback ngay...`, codOrdersToRollback.map((o: any) => ({ id: o.id, payment_method: o.payment_method, payment_status: o.payment_status })));

                            // Rollback lại cả status và payment_status cho các order COD
                            await Promise.all(
                                codOrdersToRollback.map((order: any) =>
                                    orderApi.updateOrder(order.id, {
                                        status: 'CREATED', // Rollback status về CREATED (chưa xác nhận)
                                        payment_status: 'UNPAID', // Rollback payment_status về UNPAID (chưa thanh toán)
                                    }).then(() => {
                                        console.log(`✅ Đã rollback đơn COD #${order.id} về CREATED và UNPAID ngay sau khi tạo đơn MOMO`);
                                    }).catch(err => {
                                        console.error(`❌ Lỗi rollback đơn COD #${order.id}:`, err);
                                    })
                                )
                            );

                            console.log('✅ Đã rollback status và payment_status cho các đơn COD ngay sau khi tạo đơn MOMO');
                        } else {
                            console.log('✅ Không có đơn COD nào bị cập nhật nhầm ngay sau khi tạo đơn MOMO');
                        }
                    } catch (rollbackError) {
                        console.error('❌ Lỗi khi rollback đơn COD ngay sau khi tạo đơn MOMO:', rollbackError);
                        // Không throw error, chỉ log - vẫn tiếp tục thanh toán
                    }
                }

                // Lưu danh sách order IDs vào sessionStorage để xử lý sau khi thanh toán thành công
                if (createdOrderIds.length > 1) {
                    sessionStorage.setItem('momo_order_ids', JSON.stringify(createdOrderIds));
                    console.log('💾 Đã lưu danh sách order IDs cho thanh toán MOMO:', createdOrderIds);
                }

                // Voucher đã được cập nhật ở trên, không cần lưu vào sessionStorage nữa

                if (!isAuthenticated) clearGuestData();

                // 🔥 Xóa Server Cart Item cho user đã login
                if (isAuthenticated && serverCartItemIdsToDelete.length > 0) {
                    console.log('🗑️ Deleting server cart items before MOMO redirect...');
                    await Promise.all(serverCartItemIdsToDelete.map(id => cartApi.remove(id)));
                }

                // Xóa Session Checkout
                sessionStorage.removeItem('checkout_items');

                // Redirect thanh toán với order_id đầu tiên và TỔNG TIỀN của tất cả các đơn
                const firstOrderId = createdOrderIds[0];
                console.log(`💳 Redirecting to MoMo payment: Order #${firstOrderId}, Total Amount: ${formatPrice(totalAmountForPayment)}`);
                console.log('🔍 Created order IDs:', createdOrderIds);
                console.log('🔍 Total amount for payment:', totalAmountForPayment);

                // Kiểm tra order có tồn tại không trước khi thanh toán
                try {
                    const orderDetail = await orderApi.getOrderDetail(firstOrderId);
                    console.log('✅ Order exists:', orderDetail);
                    console.log('✅ Order payment method:', orderDetail?.payment_method || orderDetail?.data?.payment_method);
                } catch (orderError) {
                    console.error('❌ Lỗi kiểm tra order:', orderError);
                    toast.error('Không thể tìm thấy đơn hàng. Vui lòng thử lại.');
                    setCreating(false);
                    return;
                }

                // Làm tròn amount thành số nguyên trước khi gửi
                const roundedAmount = Math.round(totalAmountForPayment);
                console.log('🔢 Total amount rounded for payment:', { original: totalAmountForPayment, rounded: roundedAmount });

                try {
                    await handlePayment(firstOrderId, roundedAmount);
                    // Nếu thành công, handlePayment sẽ redirect, không cần return
                    return;
                } catch (paymentError) {
                    console.error('❌ Lỗi trong handlePayment:', paymentError);
                    // handlePayment đã xử lý error và hiển thị toast, chỉ cần reset state
                    setCreating(false);
                    return;
                }
            }

            // Nếu COD (Tất cả đơn hàng đã được tạo thành công)
            if (paymentMethod === 'COD') {
                // 🔥 Xóa Server Cart Item cho user đã login
                if (isAuthenticated && serverCartItemIdsToDelete.length > 0) {
                    console.log('🗑️ Deleting server cart items after successful COD orders...');
                    await Promise.all(serverCartItemIdsToDelete.map(id => cartApi.remove(id)));
                }

                // Client/Guest Cleanup
                clearCart(); // Xóa context và local storage/cookie cho Guest (hoặc User)
                try {
                    sessionStorage.removeItem('cart_session');
                    Cookies.remove('cart_session');
                    // 👇 Xóa Session lưu trữ các sản phẩm được chọn
                    sessionStorage.removeItem('checkout_items');
                    console.log('🗑️ Client storage cleared.');
                } catch { }

                if (!isAuthenticated) clearGuestData();

                // Hiển thị thông báo trước khi redirect
                toast.success('✅ Đặt hàng thành công!', { duration: 2000 });

                // Đợi một chút trước khi redirect để toast hiển thị
                await new Promise(resolve => setTimeout(resolve, 500));

                // Tạo URL redirect phù hợp
                if (createdOrderIds.length > 1) {
                    // Nhiều đơn hàng - truyền danh sách order IDs
                    const orderIdsParam = encodeURIComponent(JSON.stringify(createdOrderIds));
                    window.location.href = isAuthenticated ? '/orders' : `/confirmation?orderIds=${orderIdsParam}`;
                } else {
                    // Chỉ một đơn hàng
                    window.location.href = isAuthenticated ? '/orders' : `/confirmation?orderId=${createdOrderIds[0]}`;
                }
            }

        } catch (e: unknown) {
            const error = e as Error & { response?: { data?: { error?: string; message?: string } }; message?: string };
            const msg = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Không thể tạo đơn hàng';
            setError(msg);
            toast.error(msg);
        } finally {
            setCreating(false);
        }
    };

    /** ===================== LOAD ORDERS ===================== */
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;
        (async () => {
            try {
                setLoading(true);
                const res = await orderApi.getOrdersByCustomer(user.id as string);
                setOrders(res?.data || []);
            } catch (err) {
                console.error('Lỗi khi tải đơn hàng:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        if (guestName) setFormErrors(prev => ({ ...prev, guestName: '' }));
        if (guestPhone) setFormErrors(prev => ({ ...prev, guestPhone: '' }));
        if (guestEmail) setFormErrors(prev => ({ ...prev, guestEmail: '' }));
        if (address) setFormErrors(prev => ({ ...prev, address: '' }));
        if (city) setFormErrors(prev => ({ ...prev, city: '' }));
    }, [guestName, guestPhone, guestEmail, address, city]);

    return (
        <BaseLayout>
            {isAuthenticated && user?.id && (
                <>
                    {/* Voucher Modal */}
                    {isVoucherModalOpen && (
                        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-white/10">
                            <VoucherModal
                                customerId={user.id}
                                isOpen={isVoucherModalOpen}
                                onClose={() => setIsVoucherModalOpen(false)}
                            />
                        </div>
                    )}

                    {/* Chat Modal */}
                    {isChatOpen && (
                        <ChatModal
                            isOpen={isChatOpen}
                            onClose={() => setIsChatOpen(false)}
                            userId={Number(user.id)}
                            storeId={0}
                            conversationId={conversationId} // ✅ truyền id xuống
                        />
                    )}

                    {/* AI Chat Modal */}
                    <AIChatModal
                        isOpen={isAIChatOpen}
                        onClose={() => setIsAIChatOpen(false)}
                        userId={Number(user.id)}
                    />

                    {/* Floating Buttons */}
                    <div
                        className={`fixed top-1/2 -translate-y-1/2 flex flex-col items-end gap-4 z-[100] transition-all duration-300 ${isChatDropdownOpen ? 'right-1' : 'right-1'
                            }`}
                    >
                        {/* Voucher Button */}
                        <button
                            onClick={() => setIsVoucherModalOpen(true)}
                            className="bg-yellow-400 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform animate-bounce"
                            title="Nhận Voucher Giảm Giá!"
                        >
                            <Gift className="w-6 h-6" />
                        </button>

                        {/* Chat Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsChatDropdownOpen(prev => !prev)}
                                className="bg-[#8B7D6B] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                                title="Bắt đầu trò chuyện"
                            >
                                <MessageSquare className="w-6 h-6" />
                            </button>

                            {isChatDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 flex flex-col gap-3 transition-all duration-300 ease-out transform origin-top-right">
                                    {/* Nút Chat với Admin */}
                                    <div className="relative group">
                                        <button
                                            onClick={async () => {
                                                if (!isAuthenticated || !user?.id) return;
                                                try {
                                                    const created = await conversationApi.createConversation({
                                                        sender_id: Number(user.id),
                                                        sender_type: 'USER',
                                                        content: '',
                                                        user_id: Number(user.id),
                                                        store_id: 1,
                                                    });
                                                    const conv = created?.conversation || created?.data || created;
                                                    setConversationId(conv?.id || null);
                                                    setIsChatOpen(true);
                                                    setIsChatDropdownOpen(false);
                                                } catch (err) {
                                                    console.error('❌ Lỗi tạo conversation:', err);
                                                }
                                            }}
                                            className="bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                                            title="Chat với Admin"
                                        >
                                            <User className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Nút Chat với AI */}
                                    <div className="relative group">
                                        <button
                                            onClick={() => {
                                                setIsAIChatOpen(true); // 2. Mở popup AI chat
                                                setIsChatDropdownOpen(false);
                                            }}
                                            className="bg-purple-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                                            title="Chat với AI"
                                        >
                                            <Bot className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Container chính: Thu hẹp tối đa (max-w-3xl) và màu nền tinh tế */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white min-h-screen shadow-sm rounded-lg">

                {/* Tiêu đề: Đơn giản, font serif */}
                <h1 className="text-3xl font-serif font-bold mb-8 text-[#8B7D6B] text-center tracking-wide relative pb-2 border-b border-[#D4C3A3]/50">
                    Xác nhận Thanh toán
                </h1>

                {/* Cấu trúc Layout: Đổi sang 2 cột cho màn hình lớn hơn */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Left: Cart Items + Voucher (3/5 width) */}
                    <div className="lg:col-span-3 space-y-5">

                        {/* Giỏ hàng */}
                        <div className="bg-white border border-[#EBE8E0] shadow-sm rounded-lg p-5">
                            {/* Giảm padding, border, shadow */}
                            <h2 className="text-lg font-semibold mb-4 text-[#2C2A24] flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-[#A38D64]" /> Chi tiết đơn hàng
                            </h2>

                            {loadingCart ? (
                                <div className="text-center text-[#65604E] py-6 text-sm flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4 animate-spin text-[#A38D64]" /> Đang tải giỏ hàng...
                                </div>
                            ) : (serverItems.length === 0 && items.length === 0) ? (
                                <div className="text-center text-gray-400 py-6 text-sm">Giỏ hàng trống</div>
                            ) : (
                                <div className="divide-y divide-[#F5F3EF]">
                                    {(() => {
                                        const itemsToDisplay = serverItems.length > 0 ? serverItems : items.map((i, idx) => {
                                            // Lấy storeId một cách cẩn thận
                                            const storeId = i.storeId || i.product?.store?.id;


                                            return {
                                                id: `guest-${idx}`,
                                                product_id: Number(i.product.id),
                                                quantity: i.quantity,
                                                store_id: Number(storeId || 0),
                                                classifications: i.classifications,
                                                classificationId: i.classificationId,
                                                price: i.price || i.product.price
                                            };
                                        });



                                        // Group items by store - sử dụng String key để tránh vấn đề
                                        const groupedByStore = itemsToDisplay.reduce((acc: Record<string, any[]>, ci: any) => {
                                            const storeId = String(ci.store_id || ci.storeId || ci.product?.store?.id || '0');

                                            if (!acc[storeId]) acc[storeId] = [];
                                            acc[storeId].push(ci);
                                            return acc;
                                        }, {});



                                        return Object.entries(groupedByStore).map(([storeId, storeItems]) => {
                                            // Lấy tên cửa hàng từ state đã fetch
                                            const storeName = storeNames[storeId] || `Cửa hàng #${storeId}`;

                                            return (
                                                <div key={storeId} className="mb-4">
                                                    <h4 className="font-semibold text-sm text-[#A38D64] mb-2 border-b border-[#F5F3EF] pb-1">
                                                        {storeName}
                                                    </h4>
                                                    {storeItems.map((ci: any) => {
                                                        const productId = ci.product_id || ci.product?.id;
                                                        const p = serverProducts[productId] || contextProducts[productId];
                                                        if (!p) {
                                                            console.warn('⚠️ Product not found for product_id:', productId);
                                                            return null;
                                                        }

                                                        const actualPrice = ci.price || p.price;

                                                        return (
                                                            <div key={ci.id || ci.key || `${productId}-${ci.quantity}`} className="flex justify-between py-3 items-center">
                                                                <div className="flex items-center gap-3">
                                                                    {p.images?.[0] && (
                                                                        <Image src={p.images[0]} alt={p.name} width={48} height={48} className="w-12 h-12 object-cover rounded-md border border-[#F1F0E8]" />
                                                                    )}
                                                                    <div>
                                                                        <div className="font-medium text-sm text-[#2C2A24]">{p.name}</div>
                                                                        <div className="text-xs text-[#7C7768]">SL: {ci.quantity}</div>
                                                                        {/* Show classification info if available - Updated condition */}
                                                                        {ci.classifications && (
                                                                            <div className="flex gap-1 mt-1">
                                                                                {ci.classifications.attribute1_name && (
                                                                                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs rounded">
                                                                                        {ci.classifications.attribute1_name}
                                                                                    </span>
                                                                                )}
                                                                                {ci.classifications.attribute2_name && (
                                                                                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs rounded">
                                                                                        {ci.classifications.attribute2_name}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="font-semibold text-sm text-[#2C2A24]">
                                                                    {formatPrice(actualPrice * ci.quantity)}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Voucher - Tiếp tục tinh chỉnh thẻ, sử dụng màu sắc tối giản */}
                        {isAuthenticated && (
                            <div className="bg-[#EFE9DC] rounded-lg shadow-inner p-4 border border-[#D4C3A3]/50">
                                {/* Giảm padding, shadow */}
                                <h2 className="text-lg font-semibold mb-3 text-[#2C2A24] flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-[#A38D64]" /> Mã ưu đãi
                                </h2>
                                {loadingVouchers ? (
                                    <div className="text-center text-[#65604E] py-4 text-sm">Đang tải...</div>
                                ) : (() => {
                                    // Filter chỉ hiển thị voucher có status khác USED
                                    const validVouchers = availableVouchers.filter(v => {
                                        // Nếu có status, chỉ hiển thị status CREATED hoặc PENDING
                                        if (v.status) {
                                            return v.status !== 'USED';
                                        }
                                        // Nếu không có status, hiển thị (backend đã filter nhưng để chắc chắn)
                                        return true;
                                    });
                                    return validVouchers.length > 0 ? (
                                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                            {validVouchers.map((v, index) => {
                                                const minOrder = Number(v.min_order_value ?? v.order_conditions ?? 0);
                                                const eligible = total >= minOrder;
                                                // So sánh bằng voucher_customer_id hoặc id để xác định voucher đã chọn
                                                const selected = (selectedVoucher?.voucher_customer_id && v.voucher_customer_id &&
                                                    Number(selectedVoucher.voucher_customer_id) === Number(v.voucher_customer_id)) ||
                                                    (selectedVoucher?.id && v.id &&
                                                        Number(selectedVoucher.id) === Number(v.id));
                                                const discountVal = Number(v.discount_value ?? v.voucher_percentage ?? 0);
                                                const type = String(v.discount_type ?? 'PERCENT').toUpperCase();

                                                // Tạo key unique: ưu tiên voucher_customer_id, sau đó id, cuối cùng là index
                                                const uniqueKey = String(v.voucher_customer_id ?? v.id ?? `voucher-${index}`);

                                                return (
                                                    <div
                                                        key={uniqueKey}
                                                        onClick={() => handleSelectVoucher(v)}
                                                        className={`p-3 rounded-md transition border-2 cursor-pointer relative ${selected
                                                            ? 'bg-[#D6C5A9] border-[#A38D64] shadow-md ring-2 ring-[#A38D64] ring-offset-2'
                                                            : eligible
                                                                ? 'bg-white border-[#D4C3A3]/50 hover:bg-[#F9F7F3] hover:border-[#A38D64]'
                                                                : 'bg-[#F3F1ED] border-[#E0DCCA] opacity-70 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        {selected && (
                                                            <div className="absolute top-2 right-2">
                                                                <CheckCircle className="w-5 h-5 text-[#A38D64]" />
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex-1">
                                                                <div className="font-bold text-sm text-[#2C2A24] truncate">
                                                                    {v.code || v.name || `Voucher #${v.id}`}
                                                                </div>
                                                                <p className="text-xs text-[#7C7768] mt-0.5 truncate">{v.description || v.desc || v.name || 'Ưu đãi đặc biệt'}</p>
                                                            </div>
                                                            <div className="text-right flex flex-col items-end pl-2">
                                                                <p className="font-bold text-base text-[#A38D64]">
                                                                    {type === 'PERCENT' || type === 'PERCENTAGE' ? `${discountVal}%` : formatPrice(discountVal)}
                                                                </p>
                                                                <p className={`text-xs mt-0.5 ${eligible ? 'text-[#3D6647]' : 'text-red-600'}`}>
                                                                    {eligible ? <CheckCircle className='w-3 h-3 inline-block mr-0.5' /> : <X className='w-3 h-3 inline-block mr-0.5' />}
                                                                    {eligible ? 'Đủ ĐK' : `Giá tổng đơn hàng phải đạt: ${formatPrice(minOrder)}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center text-[#65604E] py-4 text-sm">Bạn chưa có mã ưu đãi nào.</div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Right: Summary + Form (2/5 width) */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Tổng cộng */}
                        <div className="bg-white border border-[#EBE8E0] shadow-sm rounded-lg p-5 sticky top-4">
                            {/* Giảm padding, border, shadow */}
                            <h2 className="text-lg font-semibold mb-4 text-[#2C2A24]">💰 Tóm tắt đơn hàng</h2>
                            <div className="space-y-2">
                                {/* Giảm khoảng cách */}
                                <div className="flex justify-between text-sm text-[#5A5547]">
                                    <span>Tổng tiền hàng</span>
                                    <span className="font-medium">{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-[#5A5547]">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-medium">
                                        {calculatingShipping ? (
                                            <span className="text-xs text-gray-400">Đang tính...</span>
                                        ) : (
                                            <>
                                                {formatPrice(shippingFee)}
                                                {shippingFee === 0 && <span className="ml-1 text-green-600 text-xs">Miễn phí!</span>}
                                            </>
                                        )}
                                    </span>
                                </div>
                                {shippingMessage && shippingMessage !== 'Phí vận chuyển mặc định' && (
                                    <div className="text-xs text-gray-500 -mt-1 text-right">{shippingMessage}</div>
                                )}
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-[#3D6647] text-sm font-semibold border-t border-dashed border-gray-200 pt-2">
                                        <span>Mã giảm giá</span>
                                        <span>-{formatPrice(discountAmount)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between border-t border-gray-300 pt-3 items-center">
                                    <span className="text-base font-bold text-[#2C2A24]">Thành tiền</span>
                                    <div className="text-right">
                                        {discountAmount > 0 && <div className="text-xs text-gray-400 line-through">{formatPrice(total + shippingFee)}</div>}
                                        <span className="text-xl font-bold text-[#A38D64]">{formatPrice(totalWithShipping)}</span>
                                        {/* Font 2xl -> xl */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-white border border-[#EBE8E0] shadow-sm rounded-lg p-5 space-y-4">
                            <h2 className="text-lg font-semibold text-[#2C2A24] flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#A38D64]" /> Thông tin cơ bản
                            </h2>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <span className='w-3 h-3'>📝</span> Ghi chú đơn hàng
                                </label>
                                <textarea
                                    className="w-full border border-[#EBE8E0] rounded-md px-3 py-2 text-sm focus:border-[#A38D64] focus:ring-1 focus:ring-[#A38D64]/30 transition"
                                    rows={2}
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder="Nhập ghi chú cho đơn hàng (nếu có)"
                                />
                            </div>
                            {/* Giảm padding, border, shadow */}
                            <h2 className="text-lg font-semibold text-[#2C2A24] flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-[#A38D64]" /> Thông tin giao nhận
                            </h2>

                            {/* Guest Info */}
                            {!isAuthenticated && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                            <User className='w-3 h-3' /> Họ và tên *
                                        </label>
                                        <input
                                            className="w-full border border-[#EBE8E0] rounded-md px-3 py-2 text-sm focus:border-[#A38D64] focus:ring-1 focus:ring-[#A38D64]/30 transition"
                                            value={guestName}
                                            onChange={e => setGuestName(e.target.value)}
                                            placeholder="Nguyễn Văn A"
                                        />
                                        {formErrors.guestName && <p className="text-red-500 text-xs mt-1">{formErrors.guestName}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                <Phone className='w-3 h-3' /> SĐT *
                                            </label>
                                            <input
                                                className="w-full border border-[#EBE8E0] rounded-md px-3 py-2 text-sm focus:border-[#A38D64] focus:ring-1 focus:ring-[#A38D64]/30 transition"
                                                value={guestPhone}
                                                onChange={e => setGuestPhone(e.target.value)}
                                                placeholder="090xxxxxxx"
                                            />
                                            {formErrors.guestPhone && <p className="text-red-500 text-xs mt-1">{formErrors.guestPhone}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                <Mail className='w-3 h-3' /> Email (Không bắt buộc)
                                            </label>
                                            <input
                                                className="w-full border border-[#EBE8E0] rounded-md px-3 py-2 text-sm focus:border-[#A38D64] focus:ring-1 focus:ring-[#A38D64]/30 transition"
                                                value={guestEmail}
                                                onChange={e => setGuestEmail(e.target.value)}
                                                placeholder="example@email.com"
                                            />
                                            {formErrors.guestEmail && <p className="text-red-500 text-xs mt-1">{formErrors.guestEmail}</p>}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Address */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <MapPin className='w-3 h-3' /> Địa chỉ giao hàng *
                                </label>
                                <textarea
                                    className="w-full border border-[#EBE8E0] rounded-md px-3 py-2 text-sm focus:border-[#A38D64] focus:ring-1 focus:ring-[#A38D64]/30 transition"
                                    rows={3}
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    placeholder="Số nhà, đường, phường, quận"
                                />
                                {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <MapPin className='w-3 h-3' /> Tỉnh/Thành phố *
                                </label>

                                <select
                                    className="w-full border border-[#EBE8E0] rounded-md px-3 py-2 text-sm focus:border-[#A38D64] focus:ring-1 focus:ring-[#A38D64]/30 transition"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                >
                                    <option value="">-- Chọn Tỉnh/Thành phố --</option>

                                    {[
                                        "Hà Nội",
                                        "TP. Hồ Chí Minh",
                                        "Hải Phòng",
                                        "Đà Nẵng",
                                        "Cần Thơ",
                                        "Thái Nguyên",
                                        "Hà Giang",
                                        "Lào Cai",
                                        "Cao Bằng",
                                        "Lạng Sơn",
                                        "Quảng Ninh",
                                        "Bắc Giang",
                                        "Vĩnh Phúc",
                                        "Bắc Ninh",
                                        "Phú Thọ",
                                        "Hòa Bình",
                                        "Sơn La",
                                        "Điện Biên",
                                        "Lai Châu",
                                        "Thanh Hóa",
                                        "Nghệ An",
                                        "Hà Tĩnh",
                                        "Quảng Bình",
                                        "Quảng Trị",
                                        "Thừa Thiên Huế",
                                        "Đắk Lắk",
                                        "Đắk Nông",
                                        "Gia Lai",
                                        "Kon Tum",
                                        "Khánh Hòa",
                                        "Bình Thuận",
                                        "Bà Rịa – Vũng Tàu",
                                        "Long An",
                                        "Kiên Giang"
                                    ].map((province) => (
                                        <option key={province} value={province}>
                                            {province}
                                        </option>
                                    ))}

                                </select>

                                {formErrors.city && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <CreditCard className='w-3 h-3' /> Phương thức thanh toán
                                </label>
                                <select
                                    title='payment'
                                    className="w-full border border-[#EBE8E0] rounded-md px-3 py-2 text-sm focus:border-[#A38D64] focus:ring-1 focus:ring-[#A38D64]/30 transition bg-white"
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value as 'COD' | 'MOMO')}
                                >
                                    <option value="COD">🏠 Thanh toán khi nhận hàng (COD)</option>
                                    <option value="MOMO">💳 Thanh toán qua MoMo</option>
                                </select>
                            </div>

                            {error && <div className="bg-red-50 border border-red-300 text-red-700 text-xs px-3 py-2 rounded-md">{error}</div>}

                            {/* Submit Button */}
                            <button
                                disabled={creating || loadingCart || totalWithShipping === 0 || !address.trim() || !city.trim() || (!isAuthenticated && (!guestName.trim() || !guestPhone.trim()))}
                                onClick={handleCreate}
                                className="w-full bg-[#A38D64] text-white px-6 py-3 rounded-md text-base font-bold disabled:opacity-50 hover:bg-[#8D7A58] transition shadow-md hover:shadow-lg"
                            >
                                {creating
                                    ? <span className='flex items-center justify-center gap-2'><Clock className='w-4 h-4 animate-spin' /> Đang xử lý...</span>
                                    : paymentMethod === 'MOMO'
                                        ? `THANH TOÁN ${formatPrice(totalWithShipping)}`
                                        : `ĐẶT HÀNG COD ${formatPrice(totalWithShipping)}`}
                            </button>

                            <p className="text-center text-xs text-gray-500 pt-1">
                                *Bằng việc đặt hàng, bạn đồng ý với Điều khoản và Điều kiện của chúng tôi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
}