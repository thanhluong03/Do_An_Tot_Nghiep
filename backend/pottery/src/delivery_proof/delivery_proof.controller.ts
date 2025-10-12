import { Controller, Get, Post, Put, Delete, Body, Param, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeliveryProofService } from '../../libs/delivery_proof/src/delivery_proof.service';
import { CreateDeliveryProofDto, UpdateDeliveryProofDto, ListDeliveryProofRequestDto } from './delivery_proof.dto';

@Controller('deliveryproofs')
export class DeliveryProofController {
    constructor(private readonly deliveryProofService: DeliveryProofService) { }

    @Post('createdeliveryproof')
    @UseInterceptors(FileInterceptor('image_proof'))
    async createDeliveryProof(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateDeliveryProofDto,
    ) {
        if (!body || !body.order_id || !body.user_id) {
            throw new Error('Missing required fields in request body');
        }
        const { user_id, ...rest } = body;
        const deliveryProofData = {
            ...rest,
            driver_id: user_id,
            image_proof: file ? file.buffer : undefined,
        };
        return await this.deliveryProofService.createDeliveryProof(deliveryProofData);
    }

    @Get('listdeliveryproofs')
    async getDeliveryProofs(@Query() query: ListDeliveryProofRequestDto) {
        return await this.deliveryProofService.getDeliveryProofs(query);
    }

    @Get('detaildeliveryproof/:id')
    async getDeliveryProofDetail(@Param('id') id: number) {
        return await this.deliveryProofService.getDeliveryProofById(Number(id));
    }

    @Put('deliveryproof/update/:id')
    @UseInterceptors(FileInterceptor('image_proof'))
    async updateDeliveryProof(
        @Param('id') id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: UpdateDeliveryProofDto,
    ) {
        if (!body) {
            throw new Error('Missing request body');
        }
        const { user_id, ...rest } = body;
        const deliveryProofData: any = {
            ...rest,
            driver_id: user_id,
        };
        if (file) {
            deliveryProofData.image_proof = file.buffer;
        }
        return await this.deliveryProofService.updateDeliveryProof(Number(id), deliveryProofData);
    }

    @Delete('deleteddeliveryproof/:id')
    async deleteDeliveryProof(@Param('id') id: number) {
        return await this.deliveryProofService.deleteDeliveryProof(Number(id));
    }
}
