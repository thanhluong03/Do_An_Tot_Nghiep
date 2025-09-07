import { ProductEntity, ProductRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateProduct, IListProduct, IUpdateProduct } from './product.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class ProductService {
    findById(id: number) {
        throw new Error('Method not implemented.');
    }
    constructor(
        private readonly productRepository: ProductRepository
    ) {}

      async create(data: ICreateProduct) {
        const product = await this.productRepository.create({
          name: data.name,
          description: data.description,
          price: data.price,
          quantity: data.quantity,
          image_url: data.image_url,
          supplier_id: data.supplier_id,
          
        })
        return product
      }
    
      async findAll(params: IListProduct) {
        return this.productRepository.findAll({
          ...params,
          size: params.size || DEFAULT_PAGE_SIZE,
          page: params.page || DEFAULT_PAGE,
        })
      }
    
      async findOne(id: number) {
        const product = await this.productRepository.findById(id)
        if (!product) throw new NotFoundException('product not found')
        return product
      }
    
      async update(id: number, data: IUpdateProduct) {
        const product = {
            name: data.name,
            description: data.description,
            price: data.price,
            quantity: data.quantity,
            image_url: data.image_url,
            supplier_id: data.supplier_id,
        } as Partial<ProductEntity>
    
        return await this.productRepository.update(id, product)
      }
    
      async softDelete(id: number) {
        const product = await this.productRepository.findById(id)
        if (!product) throw new NotFoundException('product not found')
        return this.productRepository.softDelete(id)
      }
}
