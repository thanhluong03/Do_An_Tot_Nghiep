import { ProductEntity, ProductRepository, ProductImageRepository, InventoryRepository, ProductPromotionRepository, PromotionRepository, PromotionEntity } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateProduct, IListProduct, IUpdateProduct } from './product.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class ProductService {
  findById(id: number) {
    throw new Error('Method not implemented.');
  }
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productImageRepository: ProductImageRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly productPromotionRepository: ProductPromotionRepository,
    private readonly promotionRepository: PromotionRepository,
  ) { }


  async create(data: ICreateProduct) {
    try {
      console.log('Creating product with data:', {
        name: data.name,
        imagesCount: data.images?.length || 0
      });

      const product = await this.productRepository.create({
        name: data.name,
        description: data.description,
        price: data.price,
        quantity: 0,
        category_id: data.category_id,
      });

      console.log('Product created with ID:', product.id);

      if (data.images && data.images.length > 0) {
        console.log('Creating', data.images.length, 'product images');

        const productImages = data.images.map((image, index) => ({
          product_id: product.id,
          image_data: image.image_data,
          is_main_image: index === 0,
          priority: index + 1,
        }));

        await this.productImageRepository.createMany(productImages);
        console.log('Product images created successfully');
      }

      return product;
    } catch (error) {
      console.error('Error in ProductService.create:', error);
      throw error;
    }
  }

  async findAll(params: IListProduct) {
    const products = await this.productRepository.findAll({
      ...params,
      size: params.size || DEFAULT_PAGE_SIZE,
      page: params.page || DEFAULT_PAGE,
    });

    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await this.productImageRepository.findByProductId(product.id);
        const processedImages = images.map((image) => ({
          id: image.id,
          image_data: image.image_data ? image.image_data.toString('base64') : null,
          is_main_image: image.is_main_image,
          priority: image.priority,
        }));

        return {
          ...product,
          images: processedImages,
          main_image: processedImages.find((img) => img.is_main_image) || null,
        };
      })
    );

    return productsWithImages;
  }

  async findOne(id: number) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException('product not found');

    const images = await this.productImageRepository.findByProductId(id);
    const processedImages = images.map((image) => ({
      id: image.id,
      image_data: image.image_data ? image.image_data.toString('base64') : null,
      is_main_image: image.is_main_image,
      priority: image.priority,
    }));

    return {
      ...product,
      images: processedImages,
      main_image: processedImages.find((img) => img.is_main_image) || null,
    };
  }

  async update(id: number, data: IUpdateProduct) {
    const product = {
      name: data.name,
      description: data.description,
      price: data.price,
      category_id: data.category_id,
    } as Partial<ProductEntity>;

    await this.productRepository.update(id, product);

    if (data.images && data.images.length > 0) {
      await this.productImageRepository.deleteByProductId(id);

      const productImages = data.images.map((image, index) => ({
        product_id: id,
        image_data: image.image_data,
        is_main_image: index === 0,
        priority: index + 1,
      }));

      await this.productImageRepository.createMany(productImages);
    }

    return await this.findOne(id);
  }

  async softDelete(id: number) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException('product not found');

    await this.productImageRepository.deleteByProductId(id);

    return this.productRepository.softDelete(id);
  }

  async findAllByStore(storeId: number) {
    const inventories = await this.inventoryRepository.findByStore(storeId);
    const productsWithStock = await Promise.all(
      inventories.map(async (inv) => {
        const product = await this.productRepository.findById(inv.product_id);
        const images = await this.productImageRepository.findByProductId(inv.product_id);
        const processedImages = images.map((image) => ({
          id: image.id,
          image_data: image.image_data ? image.image_data.toString('base64') : null,
          is_main_image: image.is_main_image,
          priority: image.priority,
        }));
        let promotion: PromotionEntity | null = null;
        const productPromotion = await this.productPromotionRepository.findActiveByProductId(inv.product_id);
        if (productPromotion && productPromotion.promotion_id) {
          promotion = await this.promotionRepository.findById(productPromotion.promotion_id);
        }
        return {
          ...product,
          images: processedImages,
          main_image: processedImages.find((img) => img.is_main_image) || null,
          store_id: inv.store_id,
          quantity_stock: inv.quantity_stock,
          quantity_sold: inv.quantity_sold,
          store_name: inv.store?.store_name,
          store_address: inv.store?.address,
          promotion,
        };
      })
    );
    return productsWithStock;
  }

  async findAllByInventory() {
    const inventories = await this.inventoryRepository.findAll();
    const productsWithStock = await Promise.all(
      inventories.map(async (inv) => {
        const product = await this.productRepository.findById(inv.product_id);
        const images = await this.productImageRepository.findByProductId(inv.product_id);
        const processedImages = images.map((image) => ({
          id: image.id,
          image_data: image.image_data ? image.image_data.toString('base64') : null,
          is_main_image: image.is_main_image,
          priority: image.priority,
        }));
        let promotion: PromotionEntity | null = null;
        const productPromotion = await this.productPromotionRepository.findActiveByProductId(inv.product_id);
        if (productPromotion && productPromotion.promotion_id) {
          promotion = await this.promotionRepository.findById(productPromotion.promotion_id);
        }
        return {
          ...product,
          images: processedImages,
          main_image: processedImages.find((img) => img.is_main_image) || null,
          store_id: inv.store_id,
          store_name: inv.store?.store_name,
          store_address: inv.store?.address,
          quantity_stock: inv.quantity_stock,
          quantity_sold: inv.quantity_sold,
          promotion,
        };
      }),
    );
    return productsWithStock;
  }
}
