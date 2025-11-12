import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpException,
} from '@nestjs/common'
import { ImportRequestService } from '@app/import_request';
import {
  CreateImportRequestDto,
  UpdateImportRequestDto,
  UpdateImportRequestDetailDto,
  GetImportRequestsQueryDto,
} from './import_request.dto';

@Controller('importrequests')
export class ImportRequestController {
  constructor(private readonly importRequestService: ImportRequestService) { }

  @Post("createimportrequest")
  async createImportRequest(@Body() createDto: CreateImportRequestDto) {
    try {
      const result = await this.importRequestService.createImportRequest(createDto)
      return {
        message: 'Import request created successfully',
        data: result,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get("listimportrequests")
  async getAllImportRequests(@Query() query: GetImportRequestsQueryDto) {
    try {
      const { page = 1, size = 10, store_id } = query
      const result = await this.importRequestService.getAllImportRequests({
        page,
        size,
        store_id,
      })
      return {
        message: 'Import requests retrieved successfully',
        data: result.data,
        total: result.total,
        page,
        size,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('importrequestdetail/:id')
  async getImportRequestById(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.importRequestService.getImportRequestById(id)
      if (!result) {
        throw new HttpException('Import request not found', HttpStatus.NOT_FOUND)
      }
      return {
        message: 'Import request retrieved successfully',
        data: result,
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('listimportrequestsbystore/:store_id')
  async getImportRequestsByStore(@Param('store_id', ParseIntPipe) store_id: number) {
    try {
      const result = await this.importRequestService.getImportRequestsByStore(store_id)
      return {
        message: 'Import requests retrieved successfully',
        data: result,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Put('updateimportrequest/:id')
  async updateImportRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateImportRequestDto,
  ) {
    try {
      const result = await this.importRequestService.updateImportRequest(id, updateDto)
      return {
        message: 'Import request updated successfully',
        data: result,
      }
    } catch (error) {
      if (error.message === 'Import request not found') {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND)
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Delete('deleteimportrequest/:id')
  async deleteImportRequest(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.importRequestService.deleteImportRequest(id)
      return {
        message: 'Import request deleted successfully',
      }
    } catch (error) {
      if (error.message === 'Import request not found') {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND)
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}