import { Injectable, NotFoundException, BadRequestException, forwardRef } from '@nestjs/common';
import { OrderRepository, InventoryRepository, UserRepository, CustomerRepository, ProductImageRepository, ReasonChangeImageRepository, CancelReasonImageRepository, DeliveryFailReasonImageRepository } from '@app/database';
import { ProductRepository } from '@app/database';
import { ICreateOrder, IUpdateOrder, IListOrder, IOrderItem } from './order.interface';
import { OrderEntity, OrderStatus, PaymentStatus, PaymentMethod } from '@app/database';
import { OrderStatusHistory, OrderStatusHistoryEntity, OrderStatusHistoryRepository } from '@app/database';
import { CategoryRepository } from '@app/database';
import { InventoryDetailRepository, ClassificationAttributeRelationshipRepository, PaymentTransactionRepository } from '@app/database';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
interface OrdersWithTotal {
  orders: OrderEntity[];
  total: number;
  totalByStatus?: Record<string, number>;
}
@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly orderStatusHistoryRepository: OrderStatusHistoryRepository,
    private readonly userRepository: UserRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly productImageRepository: ProductImageRepository,
    private readonly productRepository: ProductRepository,
    private readonly inventoryDetailRepository: InventoryDetailRepository,
    private readonly classificationAttributeRelationshipRepository: ClassificationAttributeRelationshipRepository,
    private readonly reasonChangeImageRepository: ReasonChangeImageRepository,
    private readonly cancelReasonImageRepository: CancelReasonImageRepository,
    private readonly paymentTransactionRepository: PaymentTransactionRepository,
    private readonly deliveryFailReasonImageRepository: DeliveryFailReasonImageRepository,
  ) { }

  async createOrder(data: ICreateOrder): Promise<OrderEntity> {
    // ✅ Thêm xử lý phân biệt guest / user và gán is_login_customer đúng chuẩn
    const { items, status, payment_status, payment_method, guest_id, customer_id, note, ...orderData } = data;

    // Nếu là khách vãng lai (guest)
    if (guest_id) {
      orderData['guest_id'] = guest_id;
      orderData['customer_id'] = null;
    }
    // Nếu là người dùng đã đăng nhập
    else if (customer_id) {
      orderData['customer_id'] = customer_id;
      orderData['guest_id'] = null;
    }
    // Nếu là admin tạo đơn
    else {
      orderData['customer_id'] = null;
      orderData['guest_id'] = null;
    }

    // Bổ sung xác định kiểu khách hàng
    let isLoginCustomer = true;
    let customerInfo: any = null;
    if (customer_id) {
      const customer = await this.customerRepository.findById(customer_id);
      if (customer && typeof customer.username === 'string' && customer.username.startsWith('guest_')) {
        isLoginCustomer = false;
      }
      if (customer) {
        customerInfo = {
          id: customer.id,
          username: customer.username,
          full_name: customer.full_name,
          email: customer.email,
          phone_number: customer.phone_number,
          address: customer.address,
        };
      }
    } else {
      isLoginCustomer = false;
    }
    orderData['is_login_customer'] = isLoginCustomer;

    // Tiếp tục logic cũ
    const enrichedItems: IOrderItem[] = [];
    let total_amount = 0;

    for (const item of items) {
      const inventory = await this.inventoryRepository.findByProductAndStore(item.product_id, item.store_id);
      if (!inventory) {
        throw new NotFoundException(
          `Không tìm thấy tồn kho cho sản phẩm ${item.product_id} tại cửa hàng ${item.store_id}`,
        );
      }

      // if (inventory.quantity_stock < item.quantity) {
      //   throw new NotFoundException(
      //     `Số lượng tồn kho không đủ cho sản phẩm ${item.product_id} tại cửa hàng ${item.store_id}`,
      //   );
      // }

      const product = inventory.product;
      const store = inventory.store;

      if (product && typeof product.quantity === 'number') {
        if (product.quantity < item.quantity) {
          throw new NotFoundException(`Số lượng sản phẩm tổng không đủ cho sản phẩm ${item.product_id}`);
        }
        product.quantity -= item.quantity;
        await this.productRepository.update(product.id, { quantity: product.quantity });
      }

      let categoryName: string | undefined = undefined;
      if (product && product.category_id) {
        const category = await this.categoryRepository.findById(product.category_id);
        categoryName = category?.name;
      }

      let product_images: any[] = [];
      if (product?.id) {
        const images = await this.productImageRepository.findByProductId(product.id);
        product_images = images.map((img: any) => ({
          id: img.id,
          image_data: img.image_data ? img.image_data.toString('base64') : null,
          is_main_image: img.is_main_image ?? false,
          priority: img.priority ?? 0,
        }));
      }

      enrichedItems.push({
        ...item,
        product_name: product?.name,
        description: product?.description,
        price: product?.price,
        category_id: product?.category_id,
        category_name: categoryName,
        store_name: store?.store_name,
        store_address: store?.address,
        product_images,
        // Preserve classification information
        classification_attribute_relationship_id: item.classification_attribute_relationship_id,
        attribute1_name: item.attribute1_name,
        attribute2_name: item.attribute2_name,
      });

      total_amount += item.price_at_order * item.quantity;

      // Cập nhật inventory khi đặt hàng thành công
      if (item.classification_attribute_relationship_id) {
        // Cập nhật inventory_details
        const inventoryDetail = await this.inventoryDetailRepository.findByInventoryAndClassification(
          inventory.id,
          item.classification_attribute_relationship_id
        );

        if (inventoryDetail) {
          // Kiểm tra số lượng tồn kho
          if (inventoryDetail.quantity_stock < item.quantity) {
            throw new NotFoundException(
              `Số lượng tồn kho không đủ cho combo ${item.attribute1_name || ''} - ${item.attribute2_name || ''} tại cửa hàng ${item.store_id}`
            );
          }

          // Cập nhật inventory detail
          await this.inventoryDetailRepository.update(inventoryDetail.id, {
            quantity_stock: inventoryDetail.quantity_stock - item.quantity,
            quantity_sold: (inventoryDetail.quantity_sold || 0) + item.quantity,
          });
        }
      } else {
        // Sản phẩm không có phân loại: cập nhật inventory
        if (inventory.quantity_stock < item.quantity) {
          throw new NotFoundException(
            `Số lượng tồn kho không đủ cho sản phẩm ${item.product_id} tại cửa hàng ${item.store_id}`
          );
        }
        await this.inventoryRepository.update(inventory.id, {
          quantity_stock: inventory.quantity_stock - item.quantity,
          quantity_sold: (inventory.quantity_sold || 0) + item.quantity,
        });
      }
    }

    const current_order = {
      ...orderData,
      items: enrichedItems,
      total_amount,
      status: status ?? OrderStatus.CREATED,
      payment_status: payment_status ?? PaymentStatus.UNPAID,
      payment_method: payment_method ?? PaymentMethod.ONSITE,
      order_date: new Date(),
      customer_info: customerInfo,
      note: note ?? '',
    };

    const order = await this.orderRepository.createOrder(
      {
        ...orderData,
        total_amount,
        status: status ?? OrderStatus.CREATED,
        payment_status: payment_status ?? PaymentStatus.UNPAID,
        payment_method: payment_method ?? PaymentMethod.ONSITE,
        current_order,
        note: note ?? '',
      },
      items,
    );

    if (order && order.id) {
      const orderItems = await this.orderRepository.getOrderItemsByOrderId(order.id);
      for (let i = 0; i < current_order.items.length; i++) {
        if (orderItems[i] && orderItems[i].id) {
          (current_order.items[i] as any).orderitem_id = orderItems[i].id;
        }
      }
      await this.orderRepository.update(order.id, { current_order });
    }

    return order;
  }

  async getOrderById(id: number): Promise<any> {
    const order = await this.orderRepository.findById(id);
    if (!order) return null;
    let itemsWithImages: any[] = [];
    const currentOrder: any = order.current_order as any;
    if (currentOrder?.items && Array.isArray(currentOrder.items)) {
      itemsWithImages = await Promise.all(currentOrder.items.map(async (item: any) => {
        let product_images = item.product_images;
        if (!product_images || !Array.isArray(product_images) || product_images.length === 0) {
          const images = await this.productImageRepository.findByProductId(item.product_id);
          product_images = images.map((img: any) => ({
            id: img.id,
            image_data: img.image_data ? img.image_data.toString('base64') : null,
            is_main_image: img.is_main_image ?? false,
            priority: img.priority ?? 0,
          }));
        } else {
          product_images = product_images.map((img: any) => ({
            ...img,
            image_data: img.image_data && Buffer.isBuffer(img.image_data)
              ? img.image_data.toString('base64')
              : img.image_data,
          }));
        }
        const main_image = product_images.find((img: any) => img.is_main_image) || null;
        return {
          ...item,
          product_images,
          main_image,
        };
      }));
    }

    // Lấy lý do hoàn trả và các ảnh hoàn trả
    const returnReason = order.reason_change || null;
    const reasonChangeImages = await this.reasonChangeImageRepository.findByOrderId(id);
    const returnReasonImage = reasonChangeImages
      .filter(img => img.reason_change_image)
      .map(img => ({
        id: img.id,
        image: img.reason_change_image.toString('base64'),
      }));

    const statusHistoryRaw = await this.orderStatusHistoryRepository.getHistoryByOrderId(id);
    const statusHistory: any[] = [];
    for (const history of statusHistoryRaw) {
      let actorInfo: any = null;
      if (history.user_id) {
        const user = await this.userRepository.findById(history.user_id);
        let userName = 'Người dùng';
        if (user) {
          if (user.full_name) userName = user.full_name;
          else if (user.username) userName = user.username;
        } else {
          console.error('Không tìm thấy user với id:', history.user_id);
        }
        actorInfo = {
          user_id: history.user_id,
          name: userName,
        };
      } else if (history.customer_id) {
        const customer = await this.customerRepository.findById(history.customer_id);
        let customerName = 'Khách hàng';
        if (customer) {
          if (customer.full_name) customerName = customer.full_name;
          else if (customer.username) customerName = customer.username;
        } else {
          console.error('Không tìm thấy customer với id:', history.customer_id);
        }
        actorInfo = {
          customer_id: history.customer_id,
          name: customerName,
        };
      } else {
        actorInfo = null;
      }
      const { user_id, customer_id, ...restHistory } = history;
      statusHistory.push({
        ...restHistory,
        actor: actorInfo,
      });
    }

    // Lấy thông tin thanh toán
    const paymentTransactions = await this.paymentTransactionRepository.findByOrderId(id);

    return {
      ...order,
      current_order: {
        ...order.current_order,
        items: itemsWithImages,
      },
      statusHistory,
      returnReason,
      returnReasonImage,
      paymentTransactions,
    };
  }

  async getOrders(params: IListOrder): Promise<OrdersWithTotal> {
    const { orders, total } = await this.orderRepository.findAll(params);
    // Tính tổng tiền theo trạng thái
    const totalByStatus: Record<string, number> = {};
    for (const order of orders) {
      let customerName = '';
      let customerEmail = '';
      if (order.customer_id) {
        const customer = await this.customerRepository.findById(order.customer_id);
        customerName = customer?.full_name || customer?.username || '';
        customerEmail = customer?.email || '';
      }
      (order as any).customer_name = customerName;
      (order as any).customer_email = customerEmail;
      const currentOrder: any = order.current_order || {};
      const items = Array.isArray(currentOrder.items) ? currentOrder.items : [];
      const totalQuantity = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      (order as any).product_count = totalQuantity;

      // Thêm payment transactions cho từng order
      const paymentTransactions = await this.paymentTransactionRepository.findByOrderId(order.id);
      (order as any).paymentTransactions = paymentTransactions;

      // Chỉ lấy driverLocations: mảng các object {id, driver: {id, name}}
      if (order.driverLocations && Array.isArray(order.driverLocations)) {
        (order as any).driverLocations = order.driverLocations.map((dl: any) => ({
          id: dl.id,
          driver: dl.user ? {
            id: dl.user.id,
            name: dl.user.full_name || dl.user.username || ''
          } : null
        }));
      } else {
        (order as any).driverLocations = [];
      }

      // Tính tổng tiền theo trạng thái
      const status = order.status || 'unknown';
      if (!totalByStatus[status]) totalByStatus[status] = 0;
      totalByStatus[status] += Number(order.total_amount) || 0;
    }
    return { orders, total, totalByStatus };
  }

  async updateOrder(id: number, data: IUpdateOrder, user_id?: number, customer_id?: number, actor_type?: string): Promise<void> {
    const order = await this.orderRepository.findById(id);
    if (!order || (order as any).deleted_at) {
      throw new NotFoundException(`Order with id ${id} not found or has been deleted`);
    }
    const updateData: Partial<OrderEntity> = {};
    let statusChanged = false;
    if (data.status !== undefined && data.status !== order.status) {
      updateData.status = data.status;
      statusChanged = true;
    }
    if (data.payment_status !== undefined) updateData.payment_status = data.payment_status;
    if (data.shipping_address !== undefined) updateData.shipping_address = data.shipping_address;
    if (data.payment_method !== undefined) updateData.payment_method = data.payment_method;
    if (data.reason_change !== undefined) updateData.reason_change = data.reason_change;
    if (typeof data.note === 'string') updateData.note = data.note;
    if (data.cancel_reason !== undefined) updateData.cancel_reason = data.cancel_reason;
    if (data.delivery_fail_reason !== undefined) updateData.delivery_fail_reason = data.delivery_fail_reason;

    await this.orderRepository.update(id, updateData);

    // Xử lý reason_change_images nếu có
    if (data.reason_change_images && data.reason_change_images.length > 0) {
      // Xóa các ảnh cũ trước khi thêm ảnh mới
      await this.reasonChangeImageRepository.deleteByOrderId(id);

      // Thêm các ảnh mới
      for (const imageBuffer of data.reason_change_images) {
        await this.reasonChangeImageRepository.create({
          order_id: id,
          reason_change_image: imageBuffer,
        });
      }
      // Lưu ngày hoàn trả vào order
      const reasonChangeDate = new Date();
      await this.orderRepository.update(id, { reason_change_date: reasonChangeDate });
    }

    if (data.cancel_reason_images && data.cancel_reason_images.length > 0) {
      // Xóa các ảnh cũ trước khi thêm ảnh mới
      await this.cancelReasonImageRepository.deleteByOrderId(id);

      // Thêm các ảnh mới
      for (const imageBuffer of data.cancel_reason_images) {
        await this.cancelReasonImageRepository.create({
          order_id: id,
          cancel_reason_image: imageBuffer,
        });
      }
      // Lưu ngày hủy vào order
      const cancelReasonDate = new Date();
      await this.orderRepository.update(id, {
        cancel_date: cancelReasonDate,
        person_cancel: data.person_cancel || ''
      });
    }

    if (data.delivery_fail_images && data.delivery_fail_images.length > 0) {
      // Xóa các ảnh cũ trước khi thêm ảnh mới
      await this.deliveryFailReasonImageRepository.deleteByOrderId(id);

      // Thêm các ảnh mới
      for (const imageBuffer of data.delivery_fail_images) {
        await this.deliveryFailReasonImageRepository.create({
          order_id: id,
          delivery_fail_image: imageBuffer,
        });
      }
      await this.orderRepository.update(id, {
        delivery_fail_reason: data.delivery_fail_reason || ''
      });
    }

    if (statusChanged && updateData.status) {
      await this.orderStatusHistoryRepository.logStatusChange(
        id,
        updateData.status as unknown as OrderStatusHistory,
        user_id,
        customer_id
      );
    }
  }

  async deleteOrder(id: number): Promise<void> {
    await this.orderRepository.softDelete(id);
  }

  async exportOrdersToExcel(res: Response): Promise<void> {
    const { orders } = await this.orderRepository.findAll({ size: 1000, page: 1 });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');
    worksheet.columns = [
      { header: 'STT', key: 'index', width: 8 },
      { header: 'Tên khách hàng', key: 'customerName', width: 25 },
      { header: 'Ngày đặt', key: 'orderDate', width: 20 },
      { header: 'Tổng tiền', key: 'totalAmount', width: 15 },
      { header: 'Vị trí ship', key: 'shippingAddress', width: 30 },
      { header: 'Trạng thái thanh toán', key: 'paymentStatus', width: 20 },
      { header: 'Phương thức thanh toán', key: 'paymentMethod', width: 20 },
      { header: 'Số lượng sản phẩm', key: 'productCount', width: 15 },
      { header: 'Tên sản phẩm', key: 'productNames', width: 40 },
    ];
    let idx = 1;
    for (const order of orders) {
      let customerName = '';
      if (order.customer_id) {
        const customer = await this.customerRepository.findById(order.customer_id);
        customerName = customer?.full_name || customer?.username || '';
      }
      const currentOrder: any = order.current_order || {};
      const items = Array.isArray(currentOrder.items) ? currentOrder.items : [];
      const productNames = items.map((item: any) => item.product_name).join(', ');
      const totalQuantity = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      worksheet.addRow({
        index: idx,
        customerName,
        orderDate: order.order_date ? new Date(order.order_date).toLocaleString('vi-VN') : '',
        totalAmount: order.total_amount,
        shippingAddress: order.shipping_address || '',
        paymentStatus: order.payment_status || '',
        paymentMethod: order.payment_method || '',
        productCount: totalQuantity,
        productNames,
      });
      idx++;
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }

  async getOrdersForAdmin(start_date?: string, end_date?: string) {
    try {
      const orders = await this.orderRepository.findOrdersForAdmin([
        OrderStatus.CONFIRMED,
      ], start_date, end_date);

      const formattedOrders = await Promise.all(orders.map(async (order) => {
        let customerName = '';
        if (order.customer_id) {
          const customer = await this.customerRepository.findById(order.customer_id);
          customerName = customer?.full_name || customer?.username || 'Khách hàng';
        }

        const currentOrder: any = order.current_order || {};
        const items = Array.isArray(currentOrder.items) ? currentOrder.items : [];
        const totalQuantity = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

        return {
          id: order.id,
          customer_name: customerName,
          order_date: order.order_date,
          total_amount: order.total_amount,
          status: order.status,
          shipping_address: order.shipping_address,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          product_count: totalQuantity,
          current_order: order.current_order,
        };
      }));

      // Tính tổng tiền theo trạng thái cho orders
      const totalByStatus: Record<string, number> = {};
      for (const order of orders) {
        const status = order.status || 'unknown';
        if (!totalByStatus[status]) totalByStatus[status] = 0;
        totalByStatus[status] += Number(order.total_amount) || 0;
      }
      return {
        success: true,
        message: 'Lấy danh sách đơn hàng cho admin thành công',
        data: formattedOrders,
        totalByStatus: Object.keys(totalByStatus).length ? totalByStatus : {},
      };
    } catch (error) {
      console.error('Error getting orders for admin:', error);
      throw new BadRequestException('Không thể lấy danh sách đơn hàng');
    }
  }

  async getOrdersByStore(store_id: number, page = 1, size = 10): Promise<OrdersWithTotal> {
    // Lấy tất cả orders, lọc theo store_id trong current_order.items
    const result = await this.orderRepository.findAll({ page, size });
    const orders = Array.isArray(result.orders) ? result.orders : [];
    // Lọc các order có ít nhất một item thuộc store_id
    const filteredOrders = orders.filter(order => {
      const currentOrder: any = order.current_order || {};
      const items = Array.isArray(currentOrder.items) ? currentOrder.items : [];
      return items.some((item: any) => item.store_id === store_id);
    });
    // Tính tổng tiền theo trạng thái cho filteredOrders
    const totalByStatus: Record<string, number> = {};
    for (const order of filteredOrders) {
      const status = order.status || 'unknown';
      if (!totalByStatus[status]) totalByStatus[status] = 0;
      totalByStatus[status] += Number(order.total_amount) || 0;
    }
    return {
      orders: filteredOrders,
      total: filteredOrders.length,
      totalByStatus: Object.keys(totalByStatus).length ? totalByStatus : {},
    };
  }
}
