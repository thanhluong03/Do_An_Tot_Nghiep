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
        @Body() body: any,
    ) {
        // Accept either user_id or driver_id from body
        const userId = body?.user_id ?? body?.driver_id;
        const orderId = body?.order_id;
        if (!orderId || !userId) {
            throw new Error('Missing required fields: order_id or user_id/driver_id');
        }

        // Build payload
        const deliveryProofData: any = {
            order_id: Number(orderId),
            driver_id: Number(userId),
            captured_at: body?.captured_at ? new Date(body.captured_at) : undefined,
        };

        // Prefer uploaded file; fallback to base64 in body.image_proof or body.image
        if (file && file.buffer) {
            deliveryProofData.image_proof = file.buffer;
        } else if (body?.image_proof || body?.image) {
            const raw = String(body.image_proof || body.image);
            const commaIdx = raw.indexOf(',');
            const base64 = commaIdx >= 0 ? raw.substring(commaIdx + 1) : raw;
            try {
                deliveryProofData.image_proof = Buffer.from(base64, 'base64');
            } catch (e) {
                // ignore, will be undefined and repository can handle validation
            }
        }

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
