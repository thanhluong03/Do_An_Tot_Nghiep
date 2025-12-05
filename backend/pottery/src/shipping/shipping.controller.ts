import { Controller, Post, Body } from '@nestjs/common';
import { GeocodingService } from '@app/geocoding';

class CalculateShippingFeeDto {
    storeAddress: string;
    deliveryAddress: string;
    city: string;
}

@Controller('shipping')
export class ShippingController {
    constructor(private readonly geocodingService: GeocodingService) { }

    @Post('calculate-fee')
    async calculateShippingFee(@Body() dto: CalculateShippingFeeDto) {
        const result = await this.geocodingService.calculateShippingFee(
            dto.storeAddress,
            dto.deliveryAddress,
            dto.city,
        );
        return {
            success: true,
            data: result,
        };
    }
}
