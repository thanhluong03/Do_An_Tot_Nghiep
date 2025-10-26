import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { DriverLocationService } from '@app/driver_location';
import { OrderService } from '@app/order';
import {
    AssignDriverDto,
    AcceptOrderDto,
    RejectOrderDto,
    GetOrdersForDriverDto,
    UpdateLocationDto,
} from './driver_location.dto';

@Controller('driver-location')
export class DriverLocationController {
    constructor(
        private readonly driverLocationService: DriverLocationService,
        private readonly orderService: OrderService,
    ) { }

    @Get('admin/orders')
    async getOrdersForAdmin() {
        return await this.orderService.getOrdersForAdmin();
    }

    @Post('admin/assign-driver')
    async assignDriver(@Body() assignDriverDto: AssignDriverDto) {
        return await this.driverLocationService.assignDriver(assignDriverDto);
    }

    @Get('driver/:driverId/orders')
    async getOrdersForDriver(
        @Param('driverId') driverId: number,
        @Query() query: GetOrdersForDriverDto,
    ) {
        return await this.driverLocationService.getOrdersForDriver(driverId, query);
    }

    @Post('driver/accept-order')
    async acceptOrder(@Body() acceptOrderDto: AcceptOrderDto) {
        return await this.driverLocationService.acceptOrder(acceptOrderDto);
    }

    @Delete('driver/reject-order')
    async rejectOrder(@Body() rejectOrderDto: RejectOrderDto) {
        return await this.driverLocationService.rejectOrder(rejectOrderDto);
    }


    //liên quan đến vị trí của tài xế.
    @Put('driver/update-location')
    async updateLocation(@Body() updateLocationDto: UpdateLocationDto) {
        return await this.driverLocationService.updateLocation(updateLocationDto);
    }

    @Get('order/:orderId/location-history')
    async getLocationHistory(@Param('orderId') orderId: number) {
        return await this.driverLocationService.getLocationHistory(orderId);
    }

    @Get('order/:orderId/current-location')
    async getCurrentLocation(@Param('orderId') orderId: number) {
        return await this.driverLocationService.getCurrentLocation(orderId);
    }
}
