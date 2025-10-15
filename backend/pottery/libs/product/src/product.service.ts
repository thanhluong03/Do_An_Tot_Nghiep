import { ProductEntity, ProductRepository, ProductImageRepository, InventoryRepository, ProductPromotionRepository, PromotionRepository, PromotionEntity } from '@app/database';
import { InventoryEntity } from '@app/database';
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
        supplier_id: data.supplier_id,
        total_quantity_divided: 0,
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
      supplier_id: data.supplier_id,
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
    const inventoryMap = new Map<number, InventoryEntity[]>();
    inventories.forEach((inv: InventoryEntity) => {
      if (!inv.product_id) return;
      if (!inventoryMap.has(inv.product_id)) {
        inventoryMap.set(inv.product_id, []);
      }
      const arr = inventoryMap.get(inv.product_id);
      if (arr) arr.push(inv);
    });

    const products = await Promise.all(
      Array.from(inventoryMap.entries()).map(async ([productId, invList]: [number, InventoryEntity[]]) => {
        const product = await this.productRepository.findById(productId);
        if (!product) return null;
        const images = await this.productImageRepository.findByProductId(productId);
        const processedImages = images.map((image) => ({
          id: image.id,
          image_data: image.image_data ? image.image_data.toString('base64') : null,
          is_main_image: image.is_main_image,
          priority: image.priority,
        }));
        let promotion: PromotionEntity | null = null;
        const productPromotion = await this.productPromotionRepository.findActiveByProductId(productId);
        if (productPromotion && productPromotion.promotion_id) {
          promotion = await this.promotionRepository.findById(productPromotion.promotion_id);
        }
        const stores = invList.map((inv: InventoryEntity) => ({
          store_id: inv.store_id,
          store_name: inv.store && inv.store.store_name ? inv.store.store_name : null,
          store_address: inv.store && inv.store.address ? inv.store.address : null,
          quantity_stock: inv.quantity_stock,
          quantity_sold: inv.quantity_sold,
        }));
        return {
          ...product,
          images: processedImages,
          main_image: processedImages.find((img) => img.is_main_image) || null,
          stores,
          promotion,
        };
      }),
    );
    return {
      products: products.filter((item) => item !== null)
    };
  }

  async findAllByInventoryWithCategory(categoryId: number) {
    const inventories = await this.inventoryRepository.findAll();
    const inventoryMap = new Map<number, InventoryEntity[]>();
    inventories.forEach((inv: InventoryEntity) => {
      if (!inv.product_id) return;
      if (!inventoryMap.has(inv.product_id)) {
        inventoryMap.set(inv.product_id, []);
      }
      const arr = inventoryMap.get(inv.product_id);
      if (arr) arr.push(inv);
    });

    const products = await Promise.all(
      Array.from(inventoryMap.entries()).map(async ([productId, invList]: [number, InventoryEntity[]]) => {
        const product = await this.productRepository.findById(productId);
        if (!product || product.category_id !== categoryId) return null;
        const images = await this.productImageRepository.findByProductId(productId);
        const processedImages = images.map((image) => ({
          id: image.id,
          image_data: image.image_data ? image.image_data.toString('base64') : null,
          is_main_image: image.is_main_image,
          priority: image.priority,
        }));
        let promotion: PromotionEntity | null = null;
        const productPromotion = await this.productPromotionRepository.findActiveByProductId(productId);
        if (productPromotion && productPromotion.promotion_id) {
          promotion = await this.promotionRepository.findById(productPromotion.promotion_id);
        }
        const stores = invList.map((inv: InventoryEntity) => ({
          store_id: inv.store_id,
          store_name: inv.store && inv.store.store_name ? inv.store.store_name : null,
          store_address: inv.store && inv.store.address ? inv.store.address : null,
          quantity_stock: inv.quantity_stock,
          quantity_sold: inv.quantity_sold,
        }));
        return {
          ...product,
          images: processedImages,
          main_image: processedImages.find((img) => img.is_main_image) || null,
          stores,
          promotion,
        };
      }),
    );
    return {
      products: products.filter((item) => item !== null)
    };
  }

  async findInventoryDetailByProductId(productId: number) {
    const inventories = await this.inventoryRepository.findAll();
    const invList = inventories.filter((inv: InventoryEntity) => inv.product_id === productId);
    if (invList.length === 0) {
      throw new NotFoundException('No inventory found for this product');
    }
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundException('product not found');
    const images = await this.productImageRepository.findByProductId(productId);
    const processedImages = images.map((image) => ({
      id: image.id,
      image_data: image.image_data ? image.image_data.toString('base64') : null,
      is_main_image: image.is_main_image,
      priority: image.priority,
    }));
    let promotion: PromotionEntity | null = null;
    const productPromotion = await this.productPromotionRepository.findActiveByProductId(productId);
    if (productPromotion && productPromotion.promotion_id) {
      promotion = await this.promotionRepository.findById(productPromotion.promotion_id);
    }
    const stores = invList.map((inv: InventoryEntity) => ({
      store_id: inv.store_id,
      store_name: inv.store && inv.store.store_name ? inv.store.store_name : null,
      store_address: inv.store && inv.store.address ? inv.store.address : null,
      quantity_stock: inv.quantity_stock,
      quantity_sold: inv.quantity_sold,
    }));
    return {
      ...product,
      images: processedImages,
      main_image: processedImages.find((img) => img.is_main_image) || null,
      stores,
      promotion,
    };
  }

  async findBySupplier(supplier_id: number) {
    const products = await this.productRepository.findBySupplier(supplier_id);
    if (!products || products.length === 0) return [];

    return await Promise.all(products.map(async (product) => {
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
    }));
  }
}
