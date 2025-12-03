import { Injectable, OnModuleInit } from '@nestjs/common';
import { OrderService } from '@app/order';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly orderService: OrderService) { }

  onModuleInit() {
    // Chạy tự động gán tài xế mỗi 5 phút
    setInterval(async () => {
      try {
        await this.orderService.autoAssignDrivers();
        await this.orderService.handleExpiredAssignments();
      } catch (error) {
        console.error('Error in auto driver assignment:', error);
      }
    }, 5 * 60 * 1000); // 5 phút
  }

  getHello(): string {
    return 'Hello World!';
  }
}
