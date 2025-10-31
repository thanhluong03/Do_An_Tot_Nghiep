import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderService } from '@app/order';
import { OrderMail } from './send_mail.interface';
import * as nodemailer from 'nodemailer';

interface SendOrderMailDto {
  to: string;
  orderId: number;
}

@Injectable()
export class SendMailService {
  private transporter: any;

  constructor(private readonly orderService: OrderService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOrderConfirmationMail(dto: SendOrderMailDto) {
    // Lấy thông tin chi tiết đơn hàng từ database
    const orderDetail = await this.orderService.getOrderById(dto.orderId);
    if (!orderDetail) {
      throw new NotFoundException(
        `Không tìm thấy đơn hàng với ID: ${dto.orderId}`,
      );
    }

    // Chuyển đổi dữ liệu từ database sang format cần thiết cho email
    const order: OrderMail = {
      to: dto.to,
      orderId: orderDetail.id.toString(),
      customerName: orderDetail.customer_name || 'Khách hàng',
      products:
        orderDetail.current_order?.items?.map((item: any) => ({
          name: item.product_name || 'Sản phẩm',
          quantity: item.quantity || 0,
          price: item.price_at_order || 0,
          attribute1_name: item.attribute1_name || '',
          attribute2_name: item.attribute2_name || '',
        })) || [],
      totalAmount: orderDetail.total_amount || 0,
      paymentMethod: this.getPaymentMethodText(orderDetail.payment_method),
      paymentStatus: this.getPaymentStatusText(orderDetail.payment_status),
      orderTime: orderDetail.created_at
        ? new Date(orderDetail.created_at).toLocaleString('vi-VN')
        : 'N/A',
      shippingAddress:
        orderDetail.shipping_address || 'Chưa có thông tin địa chỉ',
    };

    // Gửi email với thông tin đã lấy từ database
    return await this.sendEmailWithOrderData(order);
  }

  private getPaymentMethodText(paymentMethod: string): string {
    const methodMap: { [key: string]: string } = {
      ONSITE: 'Tiền mặt',
      CARD: 'Thẻ tín dụng',
    };
    return methodMap[paymentMethod] || paymentMethod || 'Chưa xác định';
  }

  private getPaymentStatusText(paymentStatus: string): string {
    const statusMap: { [key: string]: string } = {
      UNPAID: 'Chưa thanh toán',
      PAID: 'Đã thanh toán',
      REFUNDED: 'Đã hoàn tiền',
    };
    return statusMap[paymentStatus] || paymentStatus || 'Chưa xác định';
  }

  private async sendEmailWithOrderData(order: OrderMail) {
    const productRows = order.products
      .map((p) => {
        const phanLoai =
          p.attribute1_name || p.attribute2_name
            ? `<div style='color:#8b6f47;font-size:0.92rem;margin-top:2px;'>Phân loại: ${[p.attribute1_name, p.attribute2_name].filter(Boolean).join(' - ')}</div>`
            : '';
        return `<tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:15px 12px;color:#333;font-weight:500;vertical-align:top;font-size:1rem;">
            <div>${p.name}</div>
            ${phanLoai}
          </td>
          <td style="padding:15px 12px;text-align:center;color:#666;font-weight:600;vertical-align:middle;">${p.quantity}</td>
          <td style="padding:15px 12px;text-align:right;color:#b48a78;font-weight:700;font-size:1.05rem;vertical-align:middle;">${p.price.toLocaleString()}₫</td>
        </tr>`;
      })
      .join('');

    const mailOptions = {
      from: 'Tiệm Gốm Nhà Gạo <' + process.env.SMTP_USER + '>',
      to: order.to,
      subject: '🌟 Xác nhận đơn hàng #' + order.orderId + ' - Tiệm Gốm Nhà Gạo',
      html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Xác nhận đơn hàng</title>
        </head>
        <body style="margin:0;padding:0;font-family:'Inter','Segoe UI','Roboto','Helvetica Neue',Arial,sans-serif;background:linear-gradient(135deg,#f8f4f0 0%,#ede4d8 100%);min-height:100vh;">
          <!-- Header Section -->
          <div style="background:linear-gradient(135deg,#8b6f47 0%,#a0845c 50%,#b48a78 100%);padding:40px 20px;text-align:center;border-bottom:3px solid #6d5537;">
            <div style="max-width:600px;margin:0 auto;">
              <h1 style="color:#fff;margin:0;font-size:2.8rem;font-weight:600;letter-spacing:1px;text-shadow:2px 2px 4px rgba(0,0,0,0.3);">TIỆM GỐM NHÀ GẠO</h1>
              <div style="width:80px;height:2px;background:#fff;margin:15px auto;opacity:0.8;"></div>
              <p style="color:#f5f5dc;font-size:1.1rem;margin:10px 0 0 0;font-style:normal;letter-spacing:0.5px;font-weight:400;">Nghệ thuật gốm sứ tinh túy Việt Nam</p>
            </div>
          </div>

          <!-- Main Content -->
          <div style="max-width:650px;margin:40px auto;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(139,111,71,0.15);overflow:hidden;">
            
            <!-- Success Banner -->
            <div style="background:linear-gradient(90deg,#4CAF50,#45a049);padding:20px;text-align:center;">
              <h2 style="color:#fff;margin:0;font-size:1.4rem;font-weight:600;">ĐƠN HÀNG ĐÃ ĐƯỢC XÁC NHẬN THÀNH CÔNG</h2>
            </div>

            <!-- Order Details -->
            <div style="padding:40px;">
              <!-- Greeting -->
              <div style="margin-bottom:30px;">
                <h3 style="color:#8b6f47;font-size:1.3rem;margin:0 0 8px 0;border-bottom:2px solid #f0e6d6;padding-bottom:8px;">Kính chào Quý khách ${order.customerName},</h3>
                <p style="color:#666;line-height:1.6;margin:15px 0;">Chúng tôi xin trân trọng cảm ơn Quý khách đã tin tưởng và lựa chọn sản phẩm của <strong>Tiệm Gốm Nhà Gạo</strong>. Đơn hàng <strong style="color:#b48a78;">#${order.orderId}</strong> của Quý khách đã được tiếp nhận và đang được xử lý với sự cẩn trọng tối đa.</p>
              </div>

              <!-- Order Summary Box -->
              <div style="background:#faf7f2;border:2px solid #e6d7c8;border-radius:8px;padding:25px;margin:25px 0;">
                <h4 style="color:#8b6f47;margin:0 0 20px 0;font-size:1.2rem;text-align:center;border-bottom:1px solid #d4c4b0;padding-bottom:10px;">📦 CHI TIẾT ĐƠN HÀNG</h4>
                
                <!-- Products Table -->
                <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                  <thead>
                    <tr style="background:linear-gradient(90deg,#8b6f47,#a0845c);color:#fff;">
                      <th style="padding:15px 12px;text-align:left;font-weight:600;font-size:0.95rem;">SẢN PHẨM</th>
                      <th style="padding:15px 12px;text-align:center;font-weight:600;font-size:0.95rem;">SỐ LƯỢNG</th>
                      <th style="padding:15px 12px;text-align:right;font-weight:600;font-size:0.95rem;">ĐƠN GIÁ</th>
                    </tr>
                  </thead>
                  <tbody style="color:#333;">${productRows}</tbody>
                </table>

                <!-- Order Info Grid -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-top:25px;">
                  <div style="background:#fff;padding:15px;border-radius:6px;border-left:4px solid #b48a78;">
                    <p style="margin:0;color:#666;font-size:0.9rem;">Tổng tiền</p>
                    <p style="margin:5px 0 0 0;font-size:1.3rem;font-weight:bold;color:#b48a78;">
                      ${(Number(order.totalAmount) + 30000).toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                  <div style="background:#fff;padding:15px;border-radius:6px;border-left:4px solid #8b6f47;">
                    <p style="margin:0;color:#666;font-size:0.9rem;">Phương thức thanh toán</p>
                    <p style="margin:5px 0 0 0;font-weight:600;color:#8b6f47;">${order.paymentMethod}</p>
                  </div>
                </div>

                <!-- Additional Info -->
                <div style="margin-top:20px;padding:20px;background:#fff;border-radius:6px;">
                  <div style="margin-bottom:12px;"><strong style="color:#8b6f47;">Trạng thái thanh toán:</strong> <span style="background:#e8f5e8;color:#2e7d2e;padding:4px 12px;border-radius:15px;font-size:0.9rem;font-weight:600;">${order.paymentStatus}</span></div>
                  <div style="margin-bottom:12px;"><strong style="color:#8b6f47;">Thời gian đặt hàng:</strong> ${order.orderTime}</div>
                  <div><strong style="color:#8b6f47;">Địa chỉ giao hàng:</strong><br><span style="color:#666;font-style:italic;">${order.shippingAddress}</span></div>
                </div>
              </div>

              <!-- Professional Thank You Section -->
              <div style="background:linear-gradient(135deg,#f8f4f0 0%,#ede4d8 100%);border-radius:8px;padding:30px;margin:30px 0;text-align:center;border:1px solid #e6d7c8;">
                <h3 style="color:#8b6f47;margin:0 0 15px 0;font-size:1.4rem;">TRÂN TRỌNG CẢM ƠN</h3>
                <p style="color:#666;line-height:1.8;margin:0;font-size:1rem;">
                  Sự tin tưởng của Quý khách là động lực to lớn giúp chúng tôi không ngừng phát triển và hoàn thiện. 
                  Mỗi sản phẩm gốm sứ được tạo ra bằng tâm huyết và tình yêu nghề nghiệp, mang trong mình tinh hoa 
                  văn hóa truyền thống Việt Nam.
                </p>
                <div style="margin:20px 0;padding:15px;background:rgba(180,138,120,0.1);border-radius:6px;border-left:4px solid #b48a78;">
                  <p style="margin:0;color:#8b6f47;font-style:italic;font-weight:500;">
                    "Chúng tôi cam kết mang đến cho Quý khách những trải nghiệm mua sắm tuyệt vời nhất và những sản phẩm chất lượng cao nhất."
                  </p>
                </div>
              </div>

              <!-- Next Steps -->
              <div style="background:#f0f8ff;border:1px solid #b8d4f0;border-radius:8px;padding:25px;margin:25px 0;">
                <h4 style="color:#2c5282;margin:0 0 15px 0;font-size:1.1rem;">📋 NHỮNG BƯỚC TIẾP THEO</h4>
                <ul style="color:#4a5568;line-height:1.7;padding-left:20px;margin:0;">
                  <li>Đơn hàng sẽ được xử lý trong vòng <strong>24-48 giờ</strong></li>
                  <li>Quý khách sẽ nhận được thông báo khi đơn hàng được đóng gói và giao vận</li>
                  <li>Thời gian giao hàng dự kiến: <strong>3-5 ngày làm việc</strong></li>
                  <li>Mọi thắc mắc, vui lòng liên hệ hotline: <strong>1900-XXXXX</strong></li>
                </ul>
              </div>

              <!-- Contact Info -->
              <div style="text-align:center;margin-top:30px;padding:25px;background:#8b6f47;color:#fff;border-radius:8px;">
                <h4 style="margin:0 0 15px 0;color:#f5f5dc;">LIÊN HỆ HỖ TRỢ</h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;color:#f5f5dc;">
                  <div>📞 Hotline: 1900-XXXXX</div>
                  <div>📧 Email: support@gomhacom.vn</div>
                  <div>🌐 Website: www.tiemgomnhagao.vn</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align:center;padding:40px 20px;background:#2d3748;color:#a0aec0;">
            <div style="max-width:600px;margin:0 auto;">
              <p style="margin:0 0 10px 0;font-size:1.1rem;color:#e2e8f0;">Tiệm Gốm Nhà Gạo</p>
              <p style="margin:0 0 15px 0;font-size:0.9rem;">Địa chỉ: Hà Nội</p>
              <div style="border-top:1px solid #4a5568;padding-top:15px;margin-top:15px;">
                <p style="margin:0;font-size:0.8rem;color:#718096;">
                  © 2025 Tiệm Gốm Nhà Gạo. Tất cả quyền được bảo lưu.<br>
                  Email này được gửi tự động, vui lòng không trả lời trực tiếp.
                  Hãy liên hệ với chúng tôi qua trang web để được hỗ trợ.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };
    const info = await this.transporter.sendMail(mailOptions);
    return info;
  }

  async sendSimpleMail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    };
    return await this.transporter.sendMail(mailOptions);
  }
}
